<?php

namespace console\controllers;

use common\models\Admitad;
use frontend\modules\coupons\models\CategoriesCoupons;
use frontend\modules\coupons\models\CouponsToCategories;
use yii\console\Controller;
use yii\helpers\Console;
use frontend\modules\coupons\models\Coupons;
use frontend\modules\stores\models\Stores;
use frontend\modules\stores\models\CpaLink;
use common\components\Help;

class CouponsController extends Controller
{

  private $stores=[];

  //добавляем параметры для запуска
  public $campaign;
  public function options($actionID)
  {
    if($actionID=='insert') {
      return ['campaign'];
    }
  }

  /**
   * Получает наш id магазина по id от адмитада
   */
  private function getStore($adm_id){
    if(!isset($this->stores[$adm_id])){
      $store=CpaLink::findOne(['cpa_id'=>1,'affiliate_id'=>$adm_id]);
      if($store){
        $this->stores[$adm_id]=$store->stores_id;
      }else{
        $this->stores[$adm_id]=false;
      }
    }
    return $this->stores[$adm_id];
  }

  /**
   * Уаляет старые купоны.
   */
  public function actionDelete()
  {
    $date = date("Y-m-d H:i:s");
    //делаем через find что б сработало afterDelete и почистило связи с категориями
    $coupons=Coupons::find()->where(['<','date_end',$date])->all();
    foreach ($coupons as $coupon){
      $coupon->delate();
    }
  }

  /**
   * ОБновление базы данных купонов
   *
   */
  public function actionInsert()
  {
    $admitad = new Admitad();
    $params = [
      //'region' => '00',
      //'campaign'=>'12026',
      'only_my' => 'on',
      /*'v' => 1,*/
      'limit'=>500,
      'offset'=>0,
    ];

    if($this->campaign){
      $params['campaign']=$this->campaign;
    }

    $categories = [];
    $coupons = $admitad->getCoupons($params);
    if($coupons){
      d($params);
      d($coupons['_meta']);
    }

    while(
      $coupons
    ) {
      foreach ($coupons['results'] as $coupon) {
        $coupon_categories = [];
        $db_coupons = Coupons::findOne(['coupon_id' => $coupon['id']]);
        //Проверяем что б купон был новый
        if (!$db_coupons) {

          $store_id = $this->getStore($coupon['campaign']['id']);
          if (!$store_id) {
            continue;
          }

          $db_coupons = new Coupons();
          $db_coupons->coupon_id = $coupon['id'];
          $db_coupons->name = $coupon['name'];
          $db_coupons->description = $coupon['description'];
          $db_coupons->store_id = $store_id;
          $db_coupons->date_start = $coupon['date_start'];
          $db_coupons->date_end = $coupon['date_end'];
          $db_coupons->goto_link = $coupon['frameset_link'];
          $db_coupons->promocode = $coupon['promocode'];
          $db_coupons->species = 0;
          $db_coupons->exclusive = $coupon['exclusive'] == 'true' ? 1 : 0;
          $db_coupons->save();

          //Добавляем категорию в массив
          foreach ($coupon['categories'] as $k => $categorie) {
            $categories[$categorie['id']] = $categorie['name'];
            $coupon_categories[$categorie['id']] = $categorie['name'];

            $coupon_cat = new CouponsToCategories();
            $coupon_cat->coupon_id = $db_coupons->uid;
            $coupon_cat->category_id = $categorie['id'];
            $coupon_cat->save();
          }
        };
      }

      $params['offset']=$coupons['_meta']['limit']+$coupons['_meta']['offset'];
      if($params['offset']<$coupons['_meta']['count']){
        $coupons = $admitad->getCoupons($params);
      }else{
        break;
      }
    }

    Coupons::deleteAll(['store_id'=>0]);

    $help = new Help();
    foreach ($categories as $k => $categorie) {
      if(!CategoriesCoupons::findOne(['uid'=>$k])){
        $cat=new CategoriesCoupons();
        $cat->uid=$k;
        $cat->name=$categorie;
        $cat->route = $help->str2url($categorie);
        $cat->save();
      }
    }
  }
}