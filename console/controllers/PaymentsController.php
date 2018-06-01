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
      Yii::$app->runAction('admitad/payments');
  }


}
