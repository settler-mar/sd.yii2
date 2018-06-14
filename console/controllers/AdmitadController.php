<?php

namespace console\controllers;

use common\components\Help;
use common\models\Admitad;
use frontend\modules\coupons\models\CategoriesCoupons;
use frontend\modules\coupons\models\Coupons;
use frontend\modules\coupons\models\CouponsToCategories;
use frontend\modules\payments\models\Payments;
use frontend\modules\stores\models\ActionsTariffs;
use frontend\modules\stores\models\CpaLink;
use frontend\modules\stores\models\Stores;
use frontend\modules\stores\models\StoresActions;
use frontend\modules\stores\models\TariffsRates;
use frontend\modules\users\models\Users;
use Yii;
use yii\console\Controller;

class AdmitadController extends Controller
{

  private $stores = [];
  private $users = [];

  //добавляем параметры для запуска
  public $day;

  /**
   * Тест Адмтада.
   */
  public function actionTest()
  {
    $test = new Admitad();
    ddd($test->test());
  }

  //добавляем параметры для запуска
  public function options($actionID)
  {
    if ($actionID == 'payments') {
      return ['day'];
    }
  }

  /**
   * Получает наш id магазина по id от адмитада
   */
  private function getStore($adm_id)
  {
    if (!isset($this->stores[$adm_id])) {
      $store = CpaLink::findOne(['cpa_id' => 1, 'affiliate_id' => $adm_id]);
      if ($store) {
        $this->stores[$adm_id] = $store->getStore(1);
      } else {
        $this->stores[$adm_id] = false;
      }
    }
    return $this->stores[$adm_id];
  }

  /**
   * @param $user_id
   * @return mixed
   *
   * Получаем данные пользователя
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

  /**
   * Обновить платежи
   */
  public function actionPayments($options = false, $send_mail = true, $day = false)
  {
    Yii::$app->balanceCalc->setNotWork(true);

    $admitad = new Admitad();
    $days = isset(Yii::$app->params['pays_update_period']) ? Yii::$app->params['pays_update_period'] : 3;
    //   $days=300;
    $params = [
        'limit' => 500,
        'offset' => 0,
//      'subid'=>61690,
    ];

    if ($this->day) {
      $days = $this->day;
    }

    if (is_array($options)) {
      $params = array_merge($params, $options);
    } else if ($options) {
      $options_t = explode(',', $options);
      foreach ($options_t as $t) {
        $t = explode('=', $t);
        if ($t[0] = 'days') {
          $params['status_updated_start'] = date('d.m.Y H:i:s', time() - 86400 * $t[1]);
        }
      }
    } else {
      $params['status_updated_start'] = date('d.m.Y H:i:s', time() - 86400 * $days); //последнии 7 дней
      //$params['status_updated_end'] = date('d.m.Y 00:00:00');
    }

    $pay_status = Admitad::getStatus();

    $remove_ref_bonus = [];
    $users = array();
    //d($params);
    //ddd($params);
    $inserted = 0;
    $updated = 0;
    $paymentsCount = 0;

    $payments = $admitad->getPayments($params);
    while ($payments) {
      foreach ($payments['results'] as $payment) {
        if (!$payment['subid'] || (int)$payment['subid'] == 0) {
          continue;
        }

        $store = $this->getStore($payment['advcampaign_id']);
        $user = $this->getUserData($payment['subid']);

        if (!$store || !$user) {
          continue;
        }

        $paymentsCount++;
        $payment['cpa_id'] = 1;//задаём жёстко
        $payment['affiliate_id'] = $payment['advcampaign_id'];//задаём жёстко

        $payment['status'] = isset($pay_status[$payment['status']]) ? $pay_status[$payment['status']] : 0;

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

        if (!in_array($user->uid, $users)) {
          $users[] = $user->uid;
        }

      }

      $params['offset'] = $payments['_meta']['limit'] + $payments['_meta']['offset'];
      if ($params['offset'] < $payments['_meta']['count']) {
        $payments = $admitad->getPayments($params);
      } else {
        break;
      }
    }


    echo 'Payments ' . $paymentsCount . "\n";
    echo 'Inserted ' . $inserted . "\n";
    echo 'Updated ' . $updated . "\n";
    //делаем пересчет бланса пользователей
    if (count($users) > 0) {
      Yii::$app->balanceCalc->setNotWork(false);
      Yii::$app->balanceCalc->todo($users, 'cash,bonus');
    }
  }


  private function getStores($params, $count = 5)
  {
    $admitad = new Admitad();
    if ($count <= 0) return false;

    try {
      $res = $admitad->getStore($params);
    } catch (Exception $e) {
      echo 'Ошибка получения данных. Осталось попыток ' . $count;
      $res = $this->getStores($params, $count - 1);
    }
    return $res;
  }

  public function actionStore()
  {
    $params = [
        'limit' => 500,
        'offset' => 0,
        'connection_status' => 'active',
    ];

    d(time());

    $action_type = array_flip(Yii::$app->params['dictionary']['action_type']);
    $stores = $this->getStores($params);
    while ($stores) {
      foreach ($stores['results'] as $store) {
        //ddd($store);

        $affiliate_id = $store['id'];
        $affiliate_list[] = $affiliate_id;

        $cpa_link = CpaLink::findOne(['cpa_id' => 1, 'affiliate_id' => $affiliate_id]);


        $route = Yii::$app->help->str2url($store['name']);

        $logo = explode(".", $store['image']);
        $logo = 'cw1_' . $route . '.' . $logo[count($logo) - 1];
        $logo = str_replace('_', '-', $logo);

        $cpa_id = false;

        if ($cpa_link) {
          //если CPA link нашли то проверяем ссылку и при необходимости обновляем ее
          if ($cpa_link->affiliate_link != $store['gotolink']) {
            $cpa_link->affiliate_link = $store['gotolink'];
            $cpa_link->save();
          }

          $cpa_id = $cpa_link->id;

          //переходим от ссылки СПА на магазин
          $db_store = $cpa_link->store;
          if ($db_store && (
                  $db_store->logo == $logo ||
                  !$db_store->logo ||
                  strpos($db_store->logo, 'cw1-') !== false
                  || strpos($db_store->logo, 'cw_') !== false
              )) {
            $test_logo = true;
          } else {
            $test_logo = false;
          }
        } else {
          $db_store = false;
          $test_logo = true;
        }

        $is_new = false; //метка если более выский уровень вновь созданный

        //если лого адмитадовский, то проверяем его наличие и при нобходимости обновляем
        if ($test_logo) {
          //проверяем лого на папки
          $path = Yii::$app->getBasePath() . '/../frontend/web/images/logos/';
          if (!file_exists($path)) {
            mkdir($path, 0777, true);
          }
          //проверяем лого на наличие
          if (!file_exists($path . $logo)) {
            if ($db_store && file_exists($path . $db_store->logo)) {
              unlink($path . $db_store->logo);
            }
            $file = file_get_contents($store['image']);
            file_put_contents($path . $logo, $file);

            if($db_store){
              $db_store->logo=$logo;
            }
          }
        }

        //если магазин не нашли по прямому подключению пробуем найти по косвеным признакам

        //поиск по ссылке на магазин
        if (!$db_store) {
          //Проверяем существования магазина на основании его адреса
          //чистим URL
          $url = str_replace("https://", "%", $store['site_url']);
          $url = str_replace("http://", "%", $url);
          $url = str_replace("www.", "", $url);
          //$url=explode('/',$url);
          //$url=$url[0].'%';
          $url = trim($url, '/') . '%';
          $db_store = Stores::find()->where(['like', 'url', $url, false])->one();
        }

        //поиск по ссылке на роуту
        if (!$db_store) {
          $db_store = Stores::find()->where(['route' => $route])->one();
        }

        //Если магазин так и не нашли то создаем
        if (!$db_store) {
          $db_store = new Stores();
          $db_store->name = $store['name'];
          if (isset($store['name_aliases'])) {
            $db_store->alias = $store['name_aliases'];
          };
          $db_store->route = $route;
          $db_store->url = $store['site_url'];
          $db_store->logo = $logo;
          $db_store->currency = $store['currency'];
          $db_store->hold_time = $store['max_hold_time'] ? (int)$store['max_hold_time'] : 30;
          $db_store->percent = 50;
          $db_store->save();
        } elseif ($test_logo && !empty($logo)) {
          //если нашли, но лого нужно обновить, то обновляем
          $db_store->logo = $logo;
        }

        $store_id = $db_store->uid;

        //если нет в базе CPA ЛИНК то создаем ее
        if (!$cpa_id) {
          $cpa_link = new CpaLink();
          $cpa_link->cpa_id = 1;
          $cpa_link->stores_id = $store_id;
          $cpa_link->affiliate_id = $affiliate_id;
          $cpa_link->affiliate_link = $store['gotolink'];
          if (!$cpa_link->save()) continue;

          $cpa_id = $cpa_link->id;
          $is_new = true;
        } else {
          //проверяем свяль CPA линк и магазина
          if ($cpa_link->stores_id != $store_id) {
            $cpa_link->stores_id = $store_id;
            $cpa_link->save();
          }
          $is_new = false;
        }

        //если СPA не выбранна то выставляем текущую
        if ((int)$db_store->active_cpa == 0) {
          $db_store->active_cpa = $cpa_id;
        }

        $p_cback = [];
        $v_cback = [];
        foreach ($store['actions_detail'] AS $action) {
          $is_new_action = $is_new;
          //если магазин был в базе то проверяем есть у него данное событие
          if (!$is_new) {
            $action_r = StoresActions::findOne(['cpa_link_id' => $cpa_id, 'action_id' => $action['id']]);
          }

          //если магазин новый или не нашли событие то создаем его
          if ($is_new || !$action_r) {
            $action_r = new StoresActions();
            $action_r->cpa_link_id = $cpa_id;
            $action_r->action_id = $action['id'];
            $action_r->name = $action['name'];
            $action_r->hold_time = $action['hold_size'];
            $action_r->type = $action_type[$action['type']];
            if (!$action_r->save()) {
              continue;
            };
            $is_new_action = true;
          }

          $action_id = $action_r->uid;// код события
          foreach ($action['tariffs'] as $tariff) {
            $is_new_tarif = $is_new_action;

            if (!$is_new_action) {
              $tariff_r = ActionsTariffs::findOne(['id_tariff' => $tariff['id'], 'id_action' => $action_id]);
            }

            if ($is_new_action || !$tariff_r) {
              $tariff_r = new ActionsTariffs();
              $tariff_r->id_tariff = $tariff['id'];
              $tariff_r->id_action = $action_id;
              $tariff_r->name = $tariff['name'];
              $tariff_r->id_action_out = $tariff['action_id'];

              $tariff_r->validate();
              if (!$tariff_r->save()) {
                continue;
              };
              $is_new_tarif = true;
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

              $f_value = [
                  'id_tariff' => $tariff_id,
                  'id_rate' => $rate['id']
              ];
              if (isset($rate['country']) && strlen($rate['country']) > 1) {
                $f_value['additional_id'] = $rate['country'];
              }

              if (!$is_new_tarif) {
                $rate_r = TariffsRates::findOne($f_value);
              }

              //если запись старая то проверяем ее на актуальность
              if (!$is_new_tarif && $rate_r) {
                if ($rate_r->auto_update == 0) { //при запрете автообновления
                  continue;
                }

                $rate_r->size = $rate['size'];
                $rate_r->price_s = $rate['price_s'];
                $rate_r->our_size = $our_size;
                $rate_r->save();

                continue;
              }

              $rate_r = new TariffsRates;
              $rate_r->id_tariff_out = $rate['tariff_id'];
              $rate_r->id_tariff = $tariff_id;
              $rate_r->id_rate = $rate['id'];
              $rate_r->price_s = $rate['price_s'];
              $rate_r->our_size = $our_size;
              $rate_r->size = $rate['size'];
              $rate_r->is_percentage = $isPercentage;
              $rate_r->additional_id = isset($rate['country']) ? $rate['country'] : '';
              $rate_r->date_s = $rate['date_s'];
              $rate_r->save();
            }
          }
        }

        if ($is_new && $db_store->active_cpa == $cpa_id) {
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
          $db_store->displayed_cashback = $result;
        }

        $db_store->url = $store['site_url'];
        if ($db_store->is_active != -1) {
          $db_store->is_active = 1;
        }
        $db_store->save();
      }
      $params['offset'] = $stores['_meta']['limit'] + $stores['_meta']['offset'];
      if ($params['offset'] < $stores['_meta']['count']) {
        $stores = $this->getStores($params);
      } else {
        break;
      }
    }

    $sql = "UPDATE `cw_stores` cws
        LEFT JOIN cw_cpa_link cpl on cpl.cpa_id=1 AND cws.`active_cpa`=cpl.id
        SET `is_active` = '0'
        WHERE cpl.affiliate_id NOT in(" . implode(',', $affiliate_list) . ") AND is_active!=-1";
    Yii::$app->db->createCommand($sql)->execute();
  }

  /**
   * ОБновление базы данных купонов
   *
   */
  public function actionCoupons()
  {
    $admitad = new Admitad();
    $params = [
      //'region' => '00',
      //'campaign'=>'12026',
        'only_my' => 'on',
      /*'v' => 1,*/
        'limit' => 500,
        'offset' => 0,
    ];

//      if($this->campaign){
//          $params['campaign']=$this->campaign;
//      }

    $categories = [];
    $coupons = $admitad->getCoupons($params);
    if ($coupons) {
      d($params);
      d($coupons['_meta']);
    }

    while (
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
          if (!$db_coupons->save()) continue;

          //Добавляем категорию в массив
          foreach ($coupon['categories'] as $k => $categorie) {
            $categories[$categorie['id']] = $categorie['name'];
            $coupon_categories[$categorie['id']] = $categorie['name'];

            $coupon_cat = new CouponsToCategories();
            $coupon_cat->coupon_id = $db_coupons->uid;
            $coupon_cat->category_id = $categorie['id'];
            $coupon_cat->save();
          }
        } else {
          $db_coupons->name = $coupon['name'];
          $db_coupons->description = $coupon['description'];
          $db_coupons->date_end = $coupon['date_end'];
          $db_coupons->goto_link = $coupon['frameset_link'];
          $db_coupons->promocode = $coupon['promocode'];
          $db_coupons->exclusive = $coupon['exclusive'] == 'true' ? 1 : 0;
          $db_coupons->save();
        }
      }

      $params['offset'] = $coupons['_meta']['limit'] + $coupons['_meta']['offset'];
      if ($params['offset'] < $coupons['_meta']['count']) {
        $coupons = $admitad->getCoupons($params);
      } else {
        break;
      }
    }

    Coupons::deleteAll(['store_id' => 0]);

    $help = new Help();
    foreach ($categories as $k => $categorie) {
      if (!CategoriesCoupons::findOne(['uid' => $k])) {
        $cat = new CategoriesCoupons();
        $cat->uid = $k;
        $cat->name = $categorie;
        $cat->route = $help->str2url($categorie);
        $cat->save();
      }
    }
  }


}
