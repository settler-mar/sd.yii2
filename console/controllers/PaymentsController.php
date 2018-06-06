<?php

namespace console\controllers;

use common\models\Ozon;
use frontend\modules\notification\models\Notifications;
use frontend\modules\payments\models\Payments;
use frontend\modules\stores\models\Cpa;
use frontend\modules\stores\models\Stores;
use frontend\modules\stores\models\CpaLink;
use frontend\modules\stores\models\TariffsRates;
use frontend\modules\users\models\Users;
use yii\console\Controller;
use yii\helpers\Console;
use frontend\modules\coupons\models\Coupons;
use Yii;

class PaymentsController extends Controller
{
    private $users = [];


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

  public function actionIndex()
  {
      echo "Payments from Admitad\n";
      Yii::$app->runAction('admitad/payments');
      echo "Payments from Ozon\n";
      $this->actionOzon();
  }

    /**
     * платежи с озон
     */
    public function actionOzon()
    {
        $users = [];
        $noUser = 0;
        $records = 0;
        $inserted = 0;
        $updated = 0;
        $store = Stores::find()->where(['route' => 'ozon'])->one();
        if (!$store) {
            echo "Store ozon.ru not found\n";
            return;
        }
        $ozon = new Ozon();
        $stat = $ozon->getOrders(time() - 60 * 60 * 24 * 30);
        /*
        ItemID ID товара в заказе string ID товара в заказе
        Name Название string Название
        State Статус done Выполнен canceled Аннулирован
        Summ Комиссия string Потенциальная или начисленная комиссия партнера
        AgentId Значение субаккаунта string Суб-аккаунт
        StateChangeMoment Дата и время изменения статуса заказа string Дата в формате: dd.mm.yyyy hh:mm:ss
        LinkDirect Прямая ссылка 0 Нет 1 Да
        IsElectronics Товар категории 0 Нет «Электроника» 1 Да
        PostingId ID части заказа string Уникальный идентификатор отправления (части заказа) в системе.
        Price Цена string Цена за 1 экземпляр товара
        Qty Количество string Количество экземпляров
        Date Дата и время оформления заказа string Формат: dd.mm.yyyy hh:mm:ss
        StatIdent Идентификатор позиции заказа string Уникальный идентификатор товара в каждом конкретном заказе клиента.
           Позволяет точно определять перемещение из принятых к обработке в выполненные.
    */

        foreach ($stat->Stats as $orderItem) {
            $records++;
            $order = $orderItem->OrderItem;
            $user = $this->getUserData((string) $order->AgentId);
            if ($user == false) {
                $noUser++;
                continue;
            }
            if (!in_array($user->uid, $users)) {
                $users[] = $user->uid;
            }
            //подогнать под формат платёжа с адмитад пока предварительно !!!!
            $payment = [
                'status' => $order->State == 'done' ? 2 : ($order->State == 'canceled' ? 1 : 0),
                'subid' => $user->uid,
                'positions' => false, //для тарифа, видимо так
                'action_id' => (string) $order->ItemId,
                'cart' => (float)$order->Price * ($order->Qty ? (int) $order->Qty : 1),
                'payment' => (float) $order->Summ,
                'click_date' => date('Y-m-d H:i:s', strtotime($order->Date)),
                'action_date' => date('Y-m-d H:i:s', strtotime($order->Date)),
                'status_updated' => date('Y-m-d H:i:s', strtotime($order->StateChangeMoment)),
                'closing_date' => date('Y-m-d H:i:s', strtotime($order->StateChangeMoment)), //??
                'product_country_code' => null, // а может сюда StatIdent ??
                'order_id' => (string) $order->StatIdent,// тоже под вопросом??
                'tariff_id' => null,
                'currency' => 'RUB',
                'affiliate_id' => $store->cpaLink->affiliate_id,
                'cpa_id' => $store->cpaLink->cpa_id
            ];
            $paymentStatus = Payments::makeOrUpdate(
                $payment,
                $store,
                $user,
                $user->referrer_id ? $this->getUserData($user->referrer_id) : null,
                ['notify' => true, 'email' => true]
            );
            if ($paymentStatus['save_status']) {
                if ($paymentStatus['new_record']) {
                    $inserted++;
                } else {
                    $updated++;
                }
            }


        }
        echo 'Payments ' . $records . "\n";
        if ($noUser) {
            echo 'User not found ' . $noUser . "\n";
        }
        echo 'Inserted ' . $inserted . "\n";
        echo 'Updated ' . $updated . "\n";
        if (count($users) > 0) {
            Yii::$app->balanceCalc->setNotWork(false);
            Yii::$app->balanceCalc->todo($users, 'cash,bonus');
        }
    }

    /**
     * получаем пользователя
     * @param $user_id
     * @return mixed
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


}
