<?php

namespace console\controllers;

use console\models\Admitad;
use frontend\modules\stores\models\SpaLink;
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

        $db_store=SpaLink::findOne(['spa_id'=>1,'affiliate_id'=>$affiliate_id]);

        $logo = explode("/", $store['image']);
        $logo = 'cw_' . $logo[count($logo) - 1];

        if($db_store){
          //если CPA link нашли то проверяем ссылку и при необходимости обновляем ее
          if($db_store->affiliate_link!=$store['gotolink']){
            $db_store->affiliate_link=$store['gotolink'];
            $db_store->save();
          }
          //переходим от ссылки СПА на магазин
          $db_store=$db_store->store;
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