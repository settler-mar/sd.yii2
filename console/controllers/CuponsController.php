<?php

namespace console\controllers;

use console\models\Admitad;
use yii\console\Controller;
use yii\helpers\Console;
use frontend\modules\coupons\models\Coupons;

class CuponsController extends Controller
{

  /**
   * Уаляет старые купоны.
   */
  public function actionDelete()
  {

  }


  /**
   * ОБновление базы данных купонов
   *
   */
  public function actionCouponsInsert(){
    $coupons=new Admitad();
    $params=[
      'keyword' => '',
      'region' => '00',
      'only_my' => 'on',
      'v' => 1,
      'limit'=>2,
    ];

    $categories = [];
    $coupons=$coupons->getCupons($params);

    foreach ($coupons['results'] as $coupon){
      $coupon_categories=[];
      $db_coupons=Coupons::findOne(['coupon_id'=>$coupon['id']]);

      //Проверяем что б купон был новый
      if(!$db_coupons){
        //Добавляем категорию в базу
        foreach ($coupon['categories'] as $k=>$categorie) {
          $categories[$categorie['id']]=$categorie['name'];
          $coupon_categories[$categorie['id']]=$categorie['name'];
        }


      };
      //d($coupon['categories']);
      //$categories[]
    }

    ddd($categories);
  }
}