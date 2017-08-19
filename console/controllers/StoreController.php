<?php

namespace console\controllers;

use console\models\Admitad;
use frontend\modules\stores\models\CpaLink;
use frontend\modules\stores\models\Stores;
use yii\console\Controller;
use Yii;

class StoreController extends Controller
{

  public function actionIndex(){
    $admitad = new Admitad();
    $params = [
      'limit' => 1,
      'offset' => 0,
      'connection_status' => 'active',
    ];

    $stores=$admitad->getStore($params);
    while ($stores) {
      foreach ($stores['results'] as $store) {
        //ddd($store);

        $affiliate_id = $store['id'];
        $affiliate_list[]=$affiliate_id;

        $cpa_link=CpaLink::findOne(['cpa_id'=>1,'affiliate_id'=>$affiliate_id]);

        $logo = explode("/", $store['image']);
        $logo = 'cw_' . $logo[count($logo) - 1];

        $cpa_id=false;

        if($cpa_link){
          //если CPA link нашли то проверяем ссылку и при необходимости обновляем ее
          if($cpa_link->affiliate_link!=$store['gotolink']){
            $cpa_link->affiliate_link=$store['gotolink'];
            $cpa_link->save();
          }

          $cpa_id=$cpa_link->id;

          //переходим от ссылки СПА на магазин
          $db_store=$cpa_link->store;
          if($db_store && $db_store->logo==$logo){
            $test_logo=true;
          }else {
            $test_logo = false;
          }
        }else{
          $db_store=false;
          $test_logo=true;
        }

        $is_new = false; //метка если более выский уровень вновь созданный
        $route = Stores::str2url($store['name']);

        //если лого адмитадовский, то проверяем его наличие и при нобходимости обновляем
        if($test_logo){
          //проверяем лого на папки
          $path=Yii::$app->getBasePath().'/../frontend/web/images/logos/';
          if(!file_exists($path)){
            mkdir($path,0777,true);
          }
          //проверяем лого на наличие
          if(!file_exists($path.$logo)){
            $file = file_get_contents($store['image']);
            file_put_contents($path . $logo, $file);
          }
        }

        //если магазин не нашли по прямому подключению пробуем найти по косвеным признакам

        //поиск по ссылке на магазин
        if(!$db_store){
          //Проверяем существования магазина на основании его адреса
          //чистим URL
          $url=str_replace("https://","%",$store['site_url']);
          $url=str_replace("http://","%",$url);
          $url=str_replace("www.","",$url);
          //$url=explode('/',$url);
          //$url=$url[0].'%';
          $url=trim($url,'/').'%';
          $db_store=Stores::find()->where(['like','url',$url,false])->one();
        }

        //поиск по ссылке на роуту
        if(!$db_store){
          $db_store=Stores::find()->where(['route'=>$route])->one();
        }

        //Если магазин так и не нашли то создаем
        if(!$db_store){
          $db_store=new Stores();
          $db_store->name=$store['name'];
          if(isset($store['name_aliases'])){
            $db_store->alias=$store['name_aliases'];
          };
          $db_store->route=$route;
          $db_store->url=$store['site_url'];
          $db_store->logo=$logo;
          $db_store->currency=$store['currency'];
          $db_store->hold_time=$store['max_hold_time'];

          $db_store->save();
        }

        $store_id=$db_store->uid;

        //если нет в базе CPA ЛИНК то создаем ее
        if($cpa_id==false){
          $cpa_link = new CpaLink();
          $cpa_link->cpa_id = 1;
          $cpa_link->stores_id = $store_id;
          $cpa_link->affiliate_id = $affiliate_id;
          $cpa_link->affiliate_link = $store['gotolink'];
          if(!$cpa_link->save())continue;

          $cpa_id=$cpa_link->id;
          $is_new=true;
        }else{
          //проверяем свяль CPA линк и магазина
          if($cpa_link->stores_id!=$store_id){
            $cpa_link->stores_id=$store_id;
            $cpa_link->save();
          }
          $is_new=false;
        }

        //если СPA не выбранна то выставляем текущую
        if((int)$db_store->active_cpa==0) {
          $db_store->active_cpa = $cpa_id;
          $db_store->save();
        }

        $p_cback = [];
        $v_cback = [];
        foreach ($store['actions_detail'] AS $action) {
          $is_new_action = $is_new;
          //если магазин был в базе то проверяем есть у него данное событие
          if (!$is_new) {
            $action_r = Acti;
            $action_r->execute([$cpa_id, $action->id]);
          }

          ddd($action);
        }
        d($store);
        ddd($db_store);
      }
      $params['offset'] = $stores['_meta']['limit'] + $stores['_meta']['offset'];
      if ($params['offset'] < $stores['_meta']['count']) {
        $stores = $admitad->getStore($params);
      } else {
        break;
      }
    }
  }
}