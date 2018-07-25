<?php

namespace console\controllers;


use yii\console\Controller;
use yii\helpers\Console;
use Yii;
use frontend\modules\stores\models\Cpa;
use frontend\modules\stores\models\CpaLink;
use frontend\modules\stores\models\Stores;

class TravelpayoutsController extends Controller{
  private $cpa;

  public function init()
  {
    $this->cpa = Cpa::findOne(['name' => 'Travelpayouts']);
    if (!$this->cpa) {
      ddd('CPA Advertise not found');
    }
  }
  /*
   Парсит шопы из travelpayouts.json. Предварительно генерируются в браузере через travelpayouts.js
   */
  public function actionStore()
  {
    $string = file_get_contents(dirname(__FILE__)."/travelpayouts.json");
    $stores = json_decode($string, true);

    foreach ($stores as $store) {
      $sd_cpa=CpaLink::find()->where([
          "cpa_id"=>$this->cpa->id,
          "affiliate_id"=>$store['advertiser_id']
      ])->one();

      $route = Yii::$app->help->str2url($store['title']);

      //Если магазин не найден в базе для данно CPA то пробуем определить его
      if(!$sd_cpa){
        //Ищим по названию
        $sd_store=Stores::find()
        ->orWhere(['name'=>$store['title']])
        ->orWhere(['route'=>$route])
        ->one();

        //Если так и не нашли магазин то продолжаем его определение
        if(!$sd_store){
          $store_id = false;
          while(!$store_id) {
            $store_id = readline($store['title']."|| SD store id (new): ");
            //если ввели id магазина то проверяем его на правельность

            if (is_numeric($store_id)) {
              $sd_store=Stores::findOne(['uid'=>$store_id]);
              if($sd_store){
                $r=readline("Это ".$sd_store->name.'? Y/n (n)');
                if($r!="Y"){
                  $store_id = false;
                  continue;
                }
              }
            }

            //Если была пустая строка то
            if($store_id==""){
              $sd_store= new Stores;

              $sd_store->name =  $store['title'];
              $sd_store->route =  $route;
              $sd_store->currency =  readline($store['title']."|| currency: ");
              $sd_store->hold_time =  readline($store['title']."|| hold_time: ");
              $sd_store->url =  readline($store['title']."|| url: ");
              $sd_store->percent =  50;

              if(!$sd_store->save()){
                ddd($sd_store->errors);
              }
              $store_id=$sd_store->uid;
            }
          }
        }

        $sd_cpa=new CpaLink;
        $sd_cpa->cpa_id=intval($this->cpa->id);
        $sd_cpa->affiliate_id=$store['advertiser_id'];
        $sd_cpa->stores_id=intval($sd_store->uid);
        $sd_cpa->affiliate_link="_____";

        if(!$sd_cpa->save()){
          ddd($sd_cpa->errors);
        }
      }else{
        $sd_store=Stores::findOne(['uid'=>$sd_cpa->stores_id]);
      }

      //ddd($store);
      //$affiliate_link=trim($sd_store->url,'/').'/?'.$store['required_params'];
      //$affiliate_link=str_replace('%(trace_id)',Yii::$app->params['travelpayouts']['user_id'].'.{{subid}}',$affiliate_link);
      $sd_cpa->affiliate_link=str_replace(Yii::$app->params['travelpayouts']['user_id'],Yii::$app->params['travelpayouts']['user_id'].'.{{subid}}',$store['link']);

      $sd_cpa->save();

      if(
        (!$sd_store->description_extend || strlen($sd_store->description_extend)<3) AND
        strlen($store['comment'])>3
      ){
        $sd_store->description_extend=$store['comment'];
      };

      $logo = explode(".", $store['img']);
      $logo = 'cw' . $this->cpa->id . '_' .$route.'.'. $logo[count($logo) - 1];
      $logo = str_replace('_', '-', $logo);
      if ($sd_store && (
              $sd_store->logo == $logo ||
              !$sd_store->logo ||
              strpos($sd_store->logo, 'cw'.$this->cpa->id.'-') !== false ||
              strpos($sd_store->logo, 'cw_') !== false
          )) {
        if(Stores::saveLogo($logo, $store['img'], $sd_store ? $sd_store->logo : false) && $sd_store){
          $sd_store->logo=$logo;
        };
      }

      $sd_store->is_offline=0;
      if(!$sd_store->active_cpa){
        $sd_store->active_cpa=$sd_cpa->id;
      }

      if($sd_store->active_cpa==$sd_cpa->id AND $sd_store->is_active!=-1){
        $sd_store->is_active=$store['status'];
      }
      $sd_store->save();
      //ddd($sd_store);
      //ddd($sd_cpa);
    }
  }

}