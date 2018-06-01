<?php

namespace console\controllers;


use yii\console\Controller;
use yii\helpers\Console;
use frontend\modules\coupons\models\Coupons;

use yii;

class CouponsController extends Controller
{

  /**
   * Уаляет старые купоны.
   */
  public function actionDelete()
  {
    $date = date("Y-m-d H:i:s");
    //делаем через find что б сработало afterDelete и почистило связи с категориями
    $coupons=Coupons::find()->where(['<','date_end',$date])->all();
    foreach ($coupons as $coupon){
      $coupon->delete();
    }
  }

  /**
   * ОБновление базы данных купонов
   *
   */
  public function actionInsert()
  {
    Yii::$app->runAction('admitad/coupons');
  }
}