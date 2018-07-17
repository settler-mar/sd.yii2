<?php

namespace console\controllers;


use yii\console\Controller;
use Yii;
use common\models\Performancehorizon;
use frontend\modules\stores\models\Cpa;
use frontend\modules\stores\models\CpaLink;
use frontend\modules\stores\models\Stores;

class PerformancehorizonController extends Controller
{

  private $cpa_id=1;

  public function init()
  {
    /*$cpa = Cpa::findOne(['name' => 'Performancehorizon']);
    if (!$cpa) {
      ddd('CPA Advertise not found');
    }

    $this->cpa_id=$cpa->id;*/
  }

  public function actionIndex(){
    $t=new Performancehorizon();
    $stores = $t->getStores();

    foreach($stores["campaigns"] as $offer){
      /*foreach($offer['campaign']['description'] as $code=>$r){
        echo $code."\n";
      }*/
      $offer=$offer['campaign'];

      $store = [
          'logo' => $offer['campaign_logo'],
          'cpa_id' => $this->cpa_id,
          'affiliate_id' => $offer['campaign_id'],
          'url' => $offer['destination_url'],
          'name' => $offer['title'],
          'currency' => "???", //в платежах и компании есть
          'cashback' => "до ".$offer['default_commission_rate']/2,
          'hold_time' => 30,
          'description' => $offer['description']['ru'], //надо посмотреть что будет идти есть еще другие языки ru ko zh_hk en_us de es_mx fr zh_cn jp pt_br en en_ca
          'short_description' => $offer['terms']['ru']['terms'],
          'conditions' => "",//надо посмотреть что будет идти
          'status' => $offer['status']=="a"?1:0,
          'affiliate_link' => 'https://prf.hn/click/camref:1011l44vX/pubref:{{subid}}', //для айхерба взял с сайта
      ];

      unset($offer['description']);
      unset($offer['terms']);
      d($offer);
      d($store);
    }
  }



}