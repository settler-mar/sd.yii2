<?php

namespace console\controllers;

use common\models\Admitad;
use frontend\modules\notification\models\Notifications;
use frontend\modules\payments\models\Payments;
use frontend\modules\stores\models\Cpa;
use frontend\modules\stores\models\CpaLink;
use frontend\modules\stores\models\TariffsRates;
use frontend\modules\users\models\Users;
use yii\console\Controller;
use yii\helpers\Console;
use frontend\modules\coupons\models\Coupons;
use Yii;

class PaymentsController extends Controller
{

  private $stores = [];
  private $users = [];

  //добавляем параметры для запуска
  public $day;

  public function options($actionID)
  {
    if ($actionID == 'index') {
      return ['day'];
    }
  }

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
  public function actionIndex($options = false, $send_mail = true, $day = false)
  {
    Yii::$app->balanceCalc->setNotWork(true);

    $admitad = new Admitad();
    $days = isset(Yii::$app->params['pays_update_period']) ? Yii::$app->params['pays_update_period'] : 3;
    //   $days=300;
    $params = [
      'limit' => 500,
      'offset' => 0,
//      'subid'=>61690,
    ];

    if ($this->day) {
      $days = $this->day;
    }

    if (is_array($options)) {
      $params = array_merge($params, $options);
    } else if ($options) {
      $options_t = explode(',', $options);
      foreach ($options_t as $t) {
        $t = explode('=', $t);
        if ($t[0] = 'days') {
          $params['status_updated_start'] = date('d.m.Y H:i:s', time() - 86400 * $t[1]);
        }
      }
    } else {
      $params['status_updated_start'] = date('d.m.Y H:i:s', time() - 86400 * $days); //последнии 7 дней
      //$params['status_updated_end'] = date('d.m.Y 00:00:00');
    }

    $pay_status = Admitad::getStatus();

    $remove_ref_bonus=[];
    $users = array();
    //d($params);
    //ddd($params);

    $payments = $admitad->getPayments($params);
    while ($payments) {
      //d($payments['_meta']);
      foreach ($payments['results'] as $payment) {
        if (!$payment['subid'] || (int)$payment['subid'] == 0) {
          continue;
        }

        /*if($payment['subid']==66197){
          continue;
        }*/
        //ddd($payment['id']);
        //$action_id = $payment['action_id'];
        //$status = isset($pay_status[$payment['status']]) ? $pay_status[$payment['status']] : 0;


        //$db_payment = Payments::findOne(['action_id' => $action_id]);
        //$is_update = false;

        $store = $this->getStore($payment['advcampaign_id']);
        $user = $this->getUserData($payment['subid']);

        if (!$store || !$user) {
          continue;
        }

//        if ($payment['positions'] && $payment['positions'][0] && $payment['positions'][0]['rate_id']) {
//          $rate = TariffsRates::find()
//            ->where(['id_rate' => $payment['positions'][0]['rate_id']])
//            ->one();
//          if ($rate) {
//            $rate_id = $rate->uid;
//          } else {
//            $rate_id = 0;
//          }
//        } else {
//          $rate_id = 0;
//        }

        $paymentStatus = Payments::makeOrUpdate(
            $payment,
            $store,
            $user,
            $user->referrer_id ? $this->getUserData($user->referrer_id) : null,
            ['notify'=> true, 'email' => true]
        );

        //echo $paymentStatus['payment']->uid.' '.$paymentStatus['payment']->action_id.' status '.$paymentStatus['save_status'].' new '.$paymentStatus['new_record']."\n";

//        if (!$db_payment) {
//          //добавляем новый платеж
//          $is_update = true;
//
//          $db_payment = new Payments(['scenario' => 'online']);
//
//          //$kurs = Yii::$app->conversion->getRUB(1, $payment['currency']);
//          $kurs = Yii::$app->conversion->getCurs($user->currency, $payment['currency']);
//
//          $loyalty_bonus = $user->loyalty_status_data['bonus'];
//          $reward = $kurs * $payment['payment'];
//
//          $cashback = $reward * $store->percent / 100;
//          $cashback = $cashback + $cashback * $loyalty_bonus / 100;
//
//          $cashback = round($cashback, 2);
//          $reward = round($reward, 2);
//
//          $db_payment->action_id = $action_id;
//          $db_payment->is_showed = 1;
//          $db_payment->affiliate_id = $payment['advcampaign_id'];
//          $db_payment->user_id = $payment['subid'];
//          $db_payment->order_price = ($payment['cart'] ? $payment['cart'] : 0);
//          $db_payment->reward = $reward;
//          $db_payment->cashback = $cashback;
//          $db_payment->status = $status;
//          $db_payment->cpa_id = 1;
//          $db_payment->click_date = $payment['click_date'];
//          $db_payment->action_date = $payment['action_date'];
//          $db_payment->status_updated = $payment['status_updated'];
//          $db_payment->closing_date = $payment['closing_date'];
//          if (isset($payment['product_country_code'])) {
//            $db_payment->additional_id = $payment['product_country_code'];
//          }
//          $db_payment->loyalty_status = $user->loyalty_status;
//          $db_payment->shop_percent = $store->percent;
//          $db_payment->order_id = $payment['order_id'];
//          $db_payment->kurs = $kurs;
//          $db_payment->action_code = $payment['tariff_id'];
//          $db_payment->rate_id = $rate_id;
//
//          if ($user->referrer_id > 0) {
//            $ref = $this->getUserData($user->referrer_id);
//            $db_payment->ref_id = $user->referrer_id;
//            $db_payment->ref_bonus_id = $ref->bonus_status;
//            $ref_bonus_data = $ref->bonus_status_data;
//
//            $ref_kurs = Yii::$app->conversion->getCurs($ref->currency, $user->currency);
//            $ref_kurs = $ref_kurs ? $ref_kurs : 1;
//            $db_payment->ref_kurs = $ref_kurs;
//
//            if (isset($ref_bonus_data['is_webmaster']) && $ref_bonus_data['is_webmaster'] == 1) {
//              $db_payment->ref_bonus = ($reward - $cashback) * $ref_bonus_data['bonus'] * $ref_kurs / 100;
//            } else {
//              $db_payment->ref_bonus = $cashback * $ref_bonus_data['bonus'] * $ref_kurs / 100;
//            }
//            $db_payment->ref_bonus = round($db_payment->ref_bonus, 2);
//          }
//
//          if (!$db_payment->closing_date) {
//            $time = strtotime($payment['action_date']);
//            $time += $store->hold_time * 24 * 60 * 60;
//            $db_payment->closing_date = date("Y-m-d H:i:s", $time);
//          }
//
//          if (!$db_payment->save()) {
//            continue;
//          };
//
//          if (!in_array($user->uid, $users)) {
//            $users[] = $user->uid;
//          }
//
//          //Создаем нотификацию пользователя
//          $notifi = new Notifications();
//          $notifi->user_id = $payment['subid'];
//          $notifi->type_id = 1;
//          $notifi->status = $status;
//          $notifi->amount = $cashback;
//          $notifi->payment_id = $db_payment->uid;
//          $notifi->save();
//
//          //Отправляем email если раздрешено у пользователя
//          if ($send_mail && $user->notice_email == 1) {
//            try {
//              Yii::$app
//                ->mailer
//                ->compose(
//                  ['html' => 'newPayment-html', 'text' => 'newPayment-text'],
//                  [
//                    'user' => $user,
//                    'payment' => $db_payment,
//                  ]
//                )
//                ->setFrom([Yii::$app->params['adminEmail'] => Yii::$app->params['adminName']])
//                ->setTo($user->email)
//                ->setSubject(Yii::$app->name . ': Зафиксирован новый кэшбэк')
//                ->send();
//            } catch (\Exception $e) {
//            }
//          }
//        } else {
//          //обновляем старый платеж
//          if ($db_payment->kurs > 0) {
//            $kurs = $db_payment->kurs;
//          } else {
//            //в старых платежах нет курса. Получаем его косвенно
//            $kurs = $db_payment->reward / $payment['payment'];
//          }
//
//          if (!$kurs) {
//            $kurs = Yii::$app->conversion->getRUB(1, $payment['currency']);
//          }
//          $ref_kurs = $db_payment->ref_kurs;
//
//          $db_payment->kurs = $kurs;
//
//          //для подтвержденных заказов ни чего не меняем уже кроме отдельных ячеек
//          if ($db_payment->status == 2) {
//            //continue;
//
//            if($db_payment->status!=$status){
//              $db_payment->status=$status;
//              Yii::$app->logger->add($payment,'payment_status_wrong',false);
//              $remove_ref_bonus[]=$db_payment->uid;
//            }
//
//            //через врямя удалить
//            $db_payment->action_code = $payment['tariff_id']; //нужно для заполнения поля тарифа
//            $db_payment->rate_id = $rate_id;
//          } else {
//            $loyalty_bonus = Yii::$app->params['dictionary']['loyalty_status'][$db_payment->loyalty_status]['bonus'];
//            $reward = $kurs * $payment['payment'];
//
//            $cashback = $reward * $db_payment->shop_percent / 100;
//            $cashback = $cashback + $cashback * $loyalty_bonus / 100;
//
//            $cashback = round($cashback, 2);
//            $reward = round($reward, 2);
//
//            $db_payment->reward = $reward;
//            $db_payment->cashback = $cashback;
//            $db_payment->status = $status;
//
//            if ($user->referrer_id > 0) {
//              $ref_bonus_data = Yii::$app->params['dictionary']['bonus_status'][$db_payment->ref_bonus_id];
//              if (isset($ref_bonus_data['is_webmaster']) && $ref_bonus_data['is_webmaster'] == 1) {
//                $db_payment->ref_bonus = ($reward - $cashback) * $ref_bonus_data['bonus'] * $ref_kurs / 100;
//              } else {
//                $db_payment->ref_bonus = $cashback * $ref_bonus_data['bonus'] * $ref_kurs/ 100;
//              }
//              $db_payment->ref_bonus = round($db_payment->ref_bonus, 2);
//            }
//          }
//
//          if (count($db_payment->getDirtyAttributes()) > 0) {
//            $is_update = $db_payment->save();
//          }
//        }

//        if ($is_update) {
//          if ($user->referrer_id > 0 && $status == 2) {
//            //Создаем нотификацию другу
//            $notifi = new Notifications();
//            $notifi->user_id = $user->referrer_id;
//            $notifi->type_id = 3;
//            $notifi->status = $status;
//            $notifi->amount = $db_payment->ref_bonus;
//            $notifi->payment_id = $db_payment->uid;
//            $notifi->save();
//          }
//
//          //на всякий проверяем на то что б с $users было все нормально
//          /*if (!$users || !is_array($users)) {
//            $users = array();
//          }*/
//
//          if (!in_array($user->uid, $users)) {
//            $users[] = $user->uid;
//          }/* else {
//            Yii::$app->logger->add(-$user->uid);
//            Yii::$app->logger->add($users);
//            d(-$user->uid);
//            d($users);
//          }*/
//        }
      }

      $params['offset'] = $payments['_meta']['limit'] + $payments['_meta']['offset'];
      if ($params['offset'] < $payments['_meta']['count']) {
        $payments = $admitad->getPayments($params);
      } else {
        break;
      }
    }

//    if(count($remove_ref_bonus)>0){
//      //Чистим нотификации по реф программе
//      Notifications::deleteAll([
//        'payment_id'=>$remove_ref_bonus,
//        'type_id'=>3
//      ]);
//    }
    d($users);
    //Yii::$app->logger->add($users);
    //делаем пересчет бланса пользователей
    if (count($users) > 0) {
      Yii::$app->balanceCalc->setNotWork(false);
      Yii::$app->balanceCalc->todo($users, 'cash,bonus');
    }
  }


  /**
   * Завершение платежей по close date
   */
  public function actionAutoComplite()
  {
    $users = [];

    $payments = Payments::find()
      ->leftJoin(Cpa::tableName(),'cw_cpa.id=cw_payments.cpa_id')
      ->andWhere(['<', 'closing_date', date("Y-m-d H:i:s")])
      ->andWhere(['status' => 0])
      ->andWhere(['auto_close' => 1])
      ->all();

    foreach ($payments as $payment) {
      $payment->status = 2;
      $payment->save();
      if (!in_array($payment->user_id, $users)) {
        $users[] = $payment->user_id;
      }
    }

    //делаем пересчет бланса пользователей
    if (count($users) > 0) {
      Yii::$app->balanceCalc->todo($users, 'cash');
    }
  }


  /*
   * Удаление дубликатов платежей
   */
  public function actionClaerDouble()
  {
    $sql = 'SELECT uid from `cw_payments` where action_id in (
            SELECT action_id FROM `cw_payments` group by action_id HAVING count(uid)>1)';

    $payments = Yii::$app->db->createCommand($sql)->queryAll();
    foreach ($payments as &$payment) {
      $payment = (int)$payment['uid'];
    }

    $tot = Payments::find()
      ->where(['uid' => $payments])
      ->select([
        'min(click_date) as min',
        'max(click_date) as max',
      ])->asArray()
      ->one();

    $params = [];
    $params['date_start'] = date('d.m.Y', strtotime($tot['min']) - 24 * 60 * 60); //последнии 7 дней
    $params['date_end'] = date('d.m.Y', strtotime($tot['max']) + 24 * 60 * 60);

    Payments::deleteAll(['uid' => $payments]);
    Notifications::deleteAll(['payment_id' => $payments]);

    $this->actionIndex($params, false);
  }
}
