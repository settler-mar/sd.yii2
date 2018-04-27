<?php

namespace console\controllers;

use frontend\modules\stores\models\ActionsTariffs;
use frontend\modules\stores\models\StoresActions;
use common\models\Admitad;
use frontend\modules\stores\models\CpaLink;
use frontend\modules\stores\models\Stores;
use frontend\modules\stores\models\TariffsRates;
use yii\console\Controller;
use Yii;

class StoreController extends Controller
{
  public function getData($params,$count=5){
    $admitad = new Admitad();
    if($count<=0)return false;

    try {
      $res=$admitad->getStore($params);
    } catch (Exception $e) {
      echo 'Ошибка получения данных. Осталось попыток '.$count;
      $res=$this->getData($params,$count-1);
    }
    return $res;
  }

  public function actionIndex(){
    $params = [
      'limit' => 500,
      'offset' => 0,
      'connection_status' => 'active',
    ];

    d(time());

    $action_type=array_flip(Yii::$app->params['dictionary']['action_type']);
    $stores=$this->getData($params);
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
          if ($db_store && ($db_store->logo == $logo || !$db_store->logo)) {
            $test_logo=true;
          }else {
            $test_logo = false;
          }
        }else{
          $db_store=false;
          $test_logo=true;
        }

        $is_new = false; //метка если более выский уровень вновь созданный
        $route = Yii::$app->help->str2url($store['name']);

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
          $db_store->hold_time=$store['max_hold_time']?(int)$store['max_hold_time']:30;
          $db_store->percent=50;
          $db_store->save();
        } elseif ($test_logo && !empty($logo)) {
            //если нашли, но лого нужно обновить, то обновляем
          $db_store->logo = $logo;
        }

        $store_id=$db_store->uid;

        //если нет в базе CPA ЛИНК то создаем ее
        if(!$cpa_id){
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
        }

        $p_cback = [];
        $v_cback = [];
        foreach ($store['actions_detail'] AS $action) {
          $is_new_action = $is_new;
          //если магазин был в базе то проверяем есть у него данное событие
          if (!$is_new) {
            $action_r = StoresActions::findOne(['cpa_link_id'=>$cpa_id,'action_id'=>$action['id']]);
          }

          //если магазин новый или не нашли событие то создаем его
          if($is_new || !$action_r){
            $action_r=new StoresActions();
            $action_r->cpa_link_id=$cpa_id;
            $action_r->action_id=$action['id'];
            $action_r->name=$action['name'];
            $action_r->hold_time=$action['hold_size'];
            $action_r->type=$action_type[$action['type']];
            if(!$action_r->save()){
              continue;
            };
            $is_new_action=true;
          }

          $action_id = $action_r->uid;// код события
          foreach ($action['tariffs'] as $tariff) {
            $is_new_tarif = $is_new_action;

            if (!$is_new_action) {
              $tariff_r = ActionsTariffs::findOne(['id_tariff'=>$tariff['id'],'id_action'=>$action_id]);
            }

            if($is_new_action || !$tariff_r){
              $tariff_r=new ActionsTariffs();
              $tariff_r->id_tariff=$tariff['id'];
              $tariff_r->id_action=$action_id;
              $tariff_r->name=$tariff['name'];
              $tariff_r->id_action_out=$tariff['action_id'];

              $tariff_r->validate();
              if(!$tariff_r->save()){
                continue;
              };
              $is_new_tarif=true;
            }
            $tariff_id = $tariff_r->uid;
            foreach ($tariff['rates'] as $rate) {
              $isPercentage = in_array($rate['is_percentage'], ["true", "True"]) ? 1 : 0;
              $our_size = floatval(str_replace(",", ".", $rate['size'])) / 2;
              if ($isPercentage) {
                if (is_float($our_size)) {
                  $our_size = round($our_size, 1);
                } else {
                  $our_size = round($our_size, 0);
                }
                $p_cback[] = $our_size;
              } else {
                $our_size = round($our_size, 2);
                $v_cback[] = $our_size;
              }

              $f_value=[
                'id_tariff'=>$tariff_id,
                'id_rate'=>$rate['id']
              ];
              if (isset($rate['country']) && strlen($rate['country'])>1) {
                $f_value['additional_id']=$rate['country'];
              }

              if (!$is_new_tarif) {
                $rate_r=TariffsRates::findOne($f_value);
              }

              //если запись старая то проверяем ее на актуальность
              if (!$is_new_tarif && $rate_r) {
                if($rate_r->auto_update==0){ //при запрете автообновления
                  continue;
                }

                $rate_r->size=$rate['size'];
                $rate_r->price_s = $rate['price_s'];
                $rate_r->our_size = $our_size;
                $rate_r->save();

                continue;
              }

              $rate_r=new TariffsRates;
              $rate_r->id_tariff_out=$rate['tariff_id'];
              $rate_r->id_tariff=$tariff_id;
              $rate_r->id_rate=$rate['id'];
              $rate_r->price_s=$rate['price_s'];
              $rate_r->our_size = $our_size;
              $rate_r->size=$rate['size'];
              $rate_r->is_percentage=$isPercentage;
              $rate_r->additional_id=isset($rate['country'])?$rate['country']:'';
              $rate_r->date_s=$rate['date_s'];
              $rate_r->save();
            }
          }
        }

        if($is_new && $db_store->active_cpa == $cpa_id){
          // :display cashback calculation
          $c_per = count($p_cback);
          $c_val = count($v_cback);
          $additional = "";
          if ($c_per > 0) {
            if ($c_val > 0 || $c_per > 1) {
              $result = "до " . max($p_cback) . "%";
              $additional .= "* (count)";
            } else {
              $result = $p_cback[0] . "%";
            }
          } else {
            if ($c_val > 0) {
              if ($c_val > 1) {
                $v = max($v_cback);
                $result = "до ";
                $additional .= "* (count)";
              } else {
                $v = $v_cback[0];
                $result = "";
              }
              $result .= $v;
            } else {
              $result = 0;
            }
          }
          $db_store->displayed_cashback=$result;
        }

        $db_store->url = $store['site_url'];
        if($db_store->is_active!=-1){
          $db_store->is_active=1;
        }
        $db_store->save();
      }
      $params['offset'] = $stores['_meta']['limit'] + $stores['_meta']['offset'];
      if ($params['offset'] < $stores['_meta']['count']) {
        $stores=$this->getData($params);
      } else {
        break;
      }
    }

    $sql="UPDATE `cw_stores` cws
        LEFT JOIN cw_cpa_link cpl on cpl.cpa_id=1 AND cws.`active_cpa`=cpl.id
        SET `is_active` = '0'
        WHERE cpl.affiliate_id NOT in(".implode(',',$affiliate_list).") AND is_active!=-1";
    Yii::$app->db->createCommand($sql)->execute();
  }
}