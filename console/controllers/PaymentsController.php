<?php

namespace console\controllers;

use console\models\Admitad;
use frontend\modules\notification\models\Notifications;
use frontend\modules\payments\models\Payments;
use frontend\modules\stores\models\CpaLink;
use frontend\modules\users\models\Users;
use yii\console\Controller;
use yii\helpers\Console;
use frontend\modules\coupons\models\Coupons;
use Yii;

class PaymentsController extends Controller
{

  private $stores = [];
  private $users = [];

  /**
   * Получает наш id магазина по id от адмитада
   */
  private function getStore($adm_id)
  {
    if (!isset($this->stores[$adm_id])) {
      $store = CpaLink::findOne(['cpa_id' => 1, 'affiliate_id' => $adm_id]);
      if ($store) {
        $this->stores[$adm_id] = $store->getStore(1);
      } else {
        $this->stores[$adm_id] = false;
      }
    }
    return $this->stores[$adm_id];
  }

  /**
   * @param $user_id
   * @return mixed
   *
   * Получаем данные пользователя
   */
  private function getUserData($user_id)
  {
    if (!isset($this->users[$user_id])) {
      $user = Users::findOne(['uid' => $user_id]);
      if ($user) {
        $this->users[$user_id] = $user;
      } else {
        $this->users[$user_id] = false;
      }
    }
    return $this->users[$user_id];
  }

  /**
   * Обновить платежи
   */
  public function actionIndex($options = false)
  {
    $admitad = new Admitad();
    $days = isset(Yii::$app->params['pays_update_period']) ? Yii::$app->params['pays_update_period'] : 3;
    $params = [
      'limit' => 500,
      'offset' => 0,
      'status_updated_start' => date('d.m.Y H:i:s', time() - 86400 * $days), //последнии 7 дней
      'status_updated_end' => date('d.m.Y H:i:s')
    ];

    if (is_array($options)) {
      $params = array_merge($params, $options);
    }

    $pay_status = array(
      'pending' => 0,
      'declined' => 1,
      'confirmed' => 2,
      'approved' => 2,
    );

    $users = [];

    $payments = $admitad->getPayments($params);
    while ($payments) {
      foreach ($payments['results'] as $payment) {
        if (!$payment['subid']) {
          continue;
        }

        $action_id = $payment['action_id'];
        $status = isset($pay_status[$payment['status']]) ? $pay_status[$payment['status']] : 0;

        $db_payment = Payments::findOne(['action_id' => $action_id]);
        $is_update = false;

        $store = $this->getStore($payment['advcampaign_id']);
        $user = $this->getUserData($payment['subid']);

        if (!$store || !$user) {
          continue;
        }

        if (!$db_payment) {
          //добавляем новый платеж
          $is_update = true;

          $db_payment = new Payments();

          $kurs = Yii::$app->conversion->getRUB(1, $payment['currency']);

          $loyalty_bonus = $user->loyalty_status_data['bonus'];
          $reward = $kurs * $payment['payment'];

          $cashback = $reward * $store->percent / 100;
          $cashback = $cashback + $cashback * $loyalty_bonus / 100;

          $cashback = round($cashback, 2);
          $reward = round($reward, 2);

          $db_payment->action_id = $action_id;
          $db_payment->is_showed = 1;
          $db_payment->affiliate_id = $payment['advcampaign_id'];
          $db_payment->user_id = $payment['subid'];
          $db_payment->order_price = $payment['cart'];
          $db_payment->reward = $reward;
          $db_payment->cashback = $cashback;
          $db_payment->status = $status;
          $db_payment->click_date = $payment['click_date'];
          $db_payment->action_date = $payment['action_date'];
          $db_payment->status_updated = $payment['status_updated'];
          $db_payment->closing_date = $payment['closing_date'];
          if (isset($payment['product_country_code'])) {
            $db_payment->additional_id = $payment['product_country_code'];
          }
          $db_payment->loyalty_status = $user->loyalty_status;
          $db_payment->shop_percent = $store->percent;
          $db_payment->order_id = $payment['order_id'];
          $db_payment->kurs = $kurs;

          if ($user->referrer_id > 0) {
            $ref = $this->getUserData($user->referrer_id);
            $db_payment->ref_id = $user->referrer_id;
            $db_payment->ref_bonus_id = $ref->bonus_status;
            $ref_bonus_data = $ref->bonus_status_data;

            if (isset($ref_bonus_data['is_webmaster']) && $ref_bonus_data['is_webmaster'] == 1) {
              $db_payment->ref_bonus = ($reward - $cashback) * $ref_bonus_data['bonus'] / 100;
            } else {
              $db_payment->ref_bonus = $cashback * $ref_bonus_data['bonus'] / 100;
            }
            $db_payment->ref_bonus = round($db_payment->ref_bonus, 2);
          }

          $db_payment->save();

          //Создаем нотификацию пользователя
          $notifi = new Notifications();
          $notifi->user_id = $payment['subid'];
          $notifi->type_id = 1;
          $notifi->status = $status;
          $notifi->amount = $cashback;
          $notifi->payment_id = $db_payment->uid;
          $notifi->save();

          //Отправляем email если раздрешено у пользователя
          if ($user->notice_email == 1) {
            Yii::$app
              ->mailer
              ->compose(
                ['html' => 'newPayment-html', 'text' => 'newPayment-text'],
                [
                  'user' => $user,
                  'payment' => $db_payment,
                ]
              )
              ->setFrom([Yii::$app->params['supportEmail'] => Yii::$app->params['supportEmail']])
              ->setTo($user->email)
              ->setSubject(Yii::$app->name . ': Начислен кэшбэк')
              ->send();
          }
        } else {
          //для подтвержденных заказов ни чего не меняем уже
          if ($db_payment->status == 2) {
            continue;
          }

          //обновляем старый платеж
          if ($db_payment->kurs > 0) {
            $kurs = $db_payment->kurs;
          } else {
            //в старых платежах нет курса. Получаем его косвенно
            $kurs = $db_payment->reward / $payment['payment'];
          }

          $loyalty_bonus = Yii::$app->params['dictionary']['loyalty_status'][$db_payment->loyalty_status]['bonus'];
          $reward = $kurs * $payment['payment'];

          $cashback = $reward * $db_payment->shop_percent / 100;
          $cashback = $cashback + $cashback * $loyalty_bonus / 100;

          $cashback = round($cashback, 2);
          $reward = round($reward, 2);

          $db_payment->reward = $reward;
          $db_payment->cashback = $cashback;
          $db_payment->status = $status;

          if ($user->referrer_id > 0) {
            $ref_bonus_data = Yii::$app->params['dictionary']['bonus_status'][$db_payment->ref_bonus_id];
            if (isset($ref_bonus_data['is_webmaster']) && $ref_bonus_data['is_webmaster'] == 1) {
              $db_payment->ref_bonus = ($reward - $cashback) * $ref_bonus_data['bonus'] / 100;
            } else {
              $db_payment->ref_bonus = $cashback * $ref_bonus_data['bonus'] / 100;
            }
            $db_payment->ref_bonus = round($db_payment->ref_bonus, 2);
          }

          if (count($db_payment->getDirtyAttributes()) > 0) {
            $is_update = $db_payment->save();
          }
        }

        if ($is_update) {
          if ($user->referrer_id > 0 && $status == 2) {
            //Создаем нотификацию другу
            $notifi = new Notifications();
            $notifi->user_id = $user->referrer_id;
            $notifi->type_id = 3;
            $notifi->status = $status;
            $notifi->amount = $db_payment->ref_bonus;
            $notifi->payment_id = $db_payment->uid;
            $notifi->save();
          }

          if (!in_array($user->uid, $users)) {
            $users[] = $user->uid;
          }
        }
      }

      $params['offset'] = $payments['_meta']['limit'] + $payments['_meta']['offset'];
      if ($params['offset'] < $payments['_meta']['count']) {
        $payments = $admitad->getPayments($params);
      } else {
        break;
      }
    }

    //делаем пересчет бланса пользователей
    if (count($users) > 0) {
      Yii::$app->balanceCalc->todo($users, 'cash');
    }
  }
}