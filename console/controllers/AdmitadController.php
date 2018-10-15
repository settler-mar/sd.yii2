<?php

namespace console\controllers;

use common\models\Admitad;
use frontend\modules\actions\models\ActionsActions;
use frontend\modules\coupons\models\Coupons;
use frontend\modules\payments\models\Payments;
use frontend\modules\products\models\Products;
use frontend\modules\stores\models\CpaLink;
use frontend\modules\stores\models\Stores;
use frontend\modules\users\models\Users;
use Yii;
use yii\console\Controller;
use yii\helpers\Console;
use frontend\modules\product\models\Product;

class AdmitadController extends Controller
{

  private $stores = [];
  private $users = [];
  private $categories = [];
  private $helpMy = false;
  private $cpa_id = 1;//admitad

  private $updateCategoriesCoupons = true;//обновлять ли категории для купона

  //добавляем параметры для запуска
  public $day;
  public $allProducts;

  public function beforeAction($action)
  {
    if (Console::isRunningOnWindows()) {
      shell_exec('chcp 65001');
    }
    return parent::beforeAction($action);
  }


  /**
   * Тест Адмтада.
   */
  public function actionTest()
  {
    $test = new Admitad();
    ddd($test->test());
  }

  /**
   * Тест Адмтада ссылкс.
   */
  public function actionTestLink()
  {
    $test = new Admitad();

    $url = "https://ru.aliexpress.com/item/Leather-Wallet-Case-for-Huawei-Y6-2018-Honor-Play-7A-Standart-Y5-2018-holder-Cover-for/32891754791.html";
    //$url="https://ru.aliexpress.com/item/Oyuncak-Squishe/32874305939.html";
    $store_id = "93";

    $store = CpaLink::findOne(['stores_id' => $store_id, 'cpa_id' => 1]);

    $options = [
        'subid' => 0,
        'ulp' => $url,
    ];

    $dp_link = $test->getDeeplink($store->affiliate_id, $options);
    if (count($dp_link) == 0) return;
    $options = [
        'link' => $dp_link[0]
    ];/**/


    $msg = $test->getTestLink($options);

    ddd($msg);

  }

  //добавляем параметры для запуска
  public function options($actionID)
  {
    if ($actionID == 'payments') {
      return ['day', 'allProducts'];
    }
  }

  /**
   * Получает наш id магазина по id от адмитада
   */
  private function getStore($adm_id)
  {
    if (!isset($this->stores[$adm_id])) {
      $cpaLink = CpaLink::findOne(['cpa_id' => $this->cpa_id, 'affiliate_id' => $adm_id]);
      if ($cpaLink) {
        $this->stores[$adm_id] = $cpaLink->store;
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


    if (is_numeric($params['status_updated_start'])) $params['status_updated_start'] = date('d.m.Y H:i:s', $params['status_updated_start']);
    if (isset($params['status_updated_end']) && is_numeric($params['status_updated_end'])) $params['status_updated_end'] = date('d.m.Y H:i:s', $params['status_updated_end']);

    $pay_status = Admitad::getStatus();

    $remove_ref_bonus = [];
    $users = array();
    //d($params);
    //ddd($params);
    $inserted = 0;
    $updated = 0;
    $paymentsCount = 0;
    $productsCount = 0;

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
        $payment['cpa_id'] = $this->cpa_id;
        $payment['affiliate_id'] = $payment['advcampaign_id'];//задаём жёстко
        $cpa_link = CpaLink::findOne(['affiliate_id' => $payment['advcampaign_id'], 'cpa_id' => 1]);
        $payment['cpa_link_id'] = $cpa_link->id;

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
            //новый платёж - пишем продукты
          } else {
            $updated++;
          }
        }
        if (($paymentStatus['save_status'] && $paymentStatus['new_record']) || $this->allProducts) {
          if (isset($payment['positions'])) {
            foreach ($payment['positions'] as $position) {
              $product_data = [
                  'product_id' => $position['product_id'] ? $position['product_id'] : $position['id'],
                  'store_id' => $store->uid,
                  'price' => $position['amount'],
                  'currency' => $payment['currency'],
                  'title' => empty($position['product_name']) ? '-' : $position['product_name'],
                  'description' => '',
                  'image' => $position['product_image'],
                  'url' => $position['product_url'],
                  'reward' => $position['payment'] * $store['percent'] / 100,
                  'click_date' => $payment['click_date'],
              ];
              Products::make($product_data);
              $productsCount++;
            }
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
    echo 'Products add ' . $productsCount . "\n";
    //делаем пересчет бланса пользователей
    if (count($users) > 0) {
      Yii::$app->balanceCalc->setNotWork(false);
      Yii::$app->balanceCalc->todo($users, 'cash,bonus');

      try {
        ActionsActions::observeActions($users);
      } catch (\Exception $e) {
        d('Error applying actions ' . $e->getMessage());
      }
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

  /*
   * получение шопов
   */
  public function actionStore()
  {
    $params = [
        'limit' => 500,
        'offset' => 0,
        'connection_status' => 'active',
    ];
    $storesAll = 0;
    $inserted = 0;
    $insertedCpaLink = 0;
    $errors = 0;
    $errorsCpaLink = 0;

    $action_type = array_flip(Yii::$app->params['dictionary']['action_type']);
    $stores = $this->getStores($params);
    while ($stores) {
      foreach ($stores['results'] as $store) {
        $storesAll++;
        $affiliate_id = $store['id'];
        $affiliate_list[] = $affiliate_id;

        $cashBack = $this->getCashback($store);
        $newStore = [
            'logo' => $store['image'],
            'cpa_id' => $this->cpa_id,
            'affiliate_id' => $affiliate_id,
            'url' => $store['site_url'],
            'name' => $store['name'],
            'alias' => isset($store['name_aliases']) ? $store['name_aliases'] : null,
            'currency' => $store['currency'],
            'cashback' => $cashBack['cashback'],
            'hold_time' => (int)$store['max_hold_time'] ? (int)$store['max_hold_time'] : 30,
            'affiliate_link' => $store['gotolink'],
            'actions' => $cashBack['actions']
        ];

        $storeResult = Stores::addOrUpdate($newStore);
        if (!$storeResult['result']) {
          $errors++;
        }
        if ($storeResult['new']) {
          $inserted++;
        }
        if ($storeResult['newCpa']) {
          $insertedCpaLink++;
          if (!$storeResult['resultCpa']) {
            $errorsCpaLink++;
          }
        }
      }

      $params['offset'] = $stores['_meta']['limit'] + $stores['_meta']['offset'];
      if ($params['offset'] < $stores['_meta']['count']) {
        $stores = $this->getStores($params);
      } else {
        break;
      }
    }

    $sql = "UPDATE `cw_stores` cws
        LEFT JOIN cw_cpa_link cpl on cpl.cpa_id=" . $this->cpa_id . " AND cws.`active_cpa`=cpl.id
        SET `is_active` = '0'
        WHERE cpl.affiliate_id NOT in(" . implode(',', $affiliate_list) . ") AND is_active!=-1";
    Yii::$app->db->createCommand($sql)->execute();
    echo 'Stores ' . $storesAll . "\n";
    echo 'Inserted ' . $inserted . "\n";
    if (!empty($errors)) {
      echo 'Stores fails ' . $errors . "\n";
    }
    echo 'Inserted Cpa link ' . $insertedCpaLink . "\n";
    if (!empty($errorsCpaLink)) {
      echo 'Cpa link fails ' . $errorsCpaLink . "\n";
    }
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

    $coupons = $admitad->getCoupons($params);
    if ($coupons) {
      d($params);
      d($coupons['_meta']);
    }

    $inserted = 0;
    $records = 0;

    while (
    $coupons
    ) {
      foreach ($coupons['results'] as $coupon) {
        $records++;
        $store = $this->getStore($coupon['campaign']['id']);
        if (!$store) {
          echo 'Store not found ' . $coupon['campaign']['id'] . "\n";
          continue;
        }

        $newCoupon = [
            'store_id' => $store->uid,
            'coupon_id' => $coupon['id'],
            'name' => $coupon['name'],
            'description' => $coupon['description'],
            'promocode' => $coupon['promocode'],
            'date_start' => $coupon['date_start'],
            'date_expire' => $coupon['date_end'],
            'link' => $coupon['frameset_link'],
            'exclusive' => $coupon['exclusive'] == 'true' ? 1 : 0,
            'categories' => $coupon['categories'],
            'cpa_id' => 1,
        ];

        $result = Coupons::makeOrUpdate($newCoupon);
        if ($result['new']) {
          $inserted++;
        }
        if (!$result['status']) {
          d($newCoupon, $result['coupon']->errors);
        }
      }
      $params['offset'] = $coupons['_meta']['limit'] + $coupons['_meta']['offset'];
      if ($params['offset'] < $coupons['_meta']['count']) {
        $coupons = $admitad->getCoupons($params);
      } else {
        break;
      }
    }

    echo "Coupons " . $records . "\n";
    echo "Inserted " . $inserted . "\n";

    Coupons::deleteAll(['store_id' => 0]);
  }

  private function getCashback($store)
  {
    $diapazon = [
        'cash' => [
            'min' => false,
            'max' => false,
        ],
        'pers' => [
            'min' => false,
            'max' => false,
        ],
    ];
    $actions = [];
    $hasPersent = false;

    $action_type = array_flip(Yii::$app->params['dictionary']['action_type']);

    foreach ($store['actions_detail'] AS $action) {
      $tariffs = [];

      foreach ($action['tariffs'] as $tariff) {
        $rates = [];

        foreach ($tariff['rates'] as $rate) {
          $isPercentage = in_array($rate['is_percentage'], ["true", "True"]) ? 1 : 0;
          $val = (float)$rate['size'];

          $hasPersent = $isPercentage || $hasPersent;
          $code = $isPercentage ? 'pers' : 'cash';
          if ($diapazon[$code]['min'] == false || $diapazon[$code]['min'] > $val) {
            $diapazon[$code]['min'] = $val;
          }
          if ($diapazon[$code]['max'] == false || $diapazon[$code]['max'] < $val) {
            $diapazon[$code]['max'] = $val;
          };

          $rates[] = [
              'rate_id' => $rate['id'],
              'price_s' => $rate['price_s'],//для адма какая то хрень
              'size' => $rate['size'],
              'is_percentage' => $isPercentage,
              'additional_id' => isset($rate['country']) && strlen($rate['country']) > 1 ? $rate['country'] : "",
              'date_s' => $rate['date_s']
          ];
        }

        $tariffs[] = [
            'tariff_id' => $tariff['id'],
            'name' => $tariff['name'],
            'rates' => $rates
        ];
      }

      $actions[] = [
          'action_id' => $action['id'],
          'name' => $action['name'],
          'hold_time' => $action['hold_size'],
          'type' => $action_type[$action['type']],
          'tariffs' => $tariffs
      ];
    }

    $code = $hasPersent ? 'pers' : 'cash';
    $cashback = "";
    if ($diapazon[$code]['min'] < $diapazon[$code]['max']) {
      $cashback = "до ";
    }
    $cashback .= ($diapazon[$code]['max']/2) . ($hasPersent ? '%' : '');

    return [
        'cashback' => $cashback,
        'actions' => $actions,
        'diapazon' => $diapazon,
        'hasParsent' => $hasPersent,
    ];
  }

  public function actionProduct()
  {
      $count = 0;
      $insert = 0;
      $error = 0;
      $categories = 0;
      $admitad = new Admitad();
      $products = $admitad->getProducts();
      foreach ($products as $product) {
          $count++;
          $params = explode('|', (string) $product['param']);
          $paramsArray = [];
          foreach ($params as $param) {
              $item  = explode(':', $param);
              if (isset($item[1])) {
                  $paramsArray[$item[0]] = preg_split('/[\/,]+/', $item[1]);
              }
              //d($item[1], $paramsArray[$item[0]]);
          }
          $product['params'] = empty($paramsArray) ? null : $paramsArray;
          $product['available'] = (string) $product['available'] = 'true' ? 1 :((string) $product['available']='false' ? 0 : 2);
          $product['categories'] = explode('/', (string) $product['categoryId']);
          $product['params_original'] = $product['param'];
          $product['cpa_id'] = 1;//admitad
          $result = Product::addOrUpdate($product);
          if ($result['error']) {
              d($result['product']->errors);
          }
          $insert += $result['insert'];
          $error += $result['error'];
          $categories += $result['categories'];
          echo $count."\n";
      }
      echo 'Products ' . $count . "\n";
      echo 'Inserted ' . $insert . "\n";
      if ($categories) {
        echo 'Inserted categories ' . $categories . "\n";
      }
      if ($error) {
        echo 'Errors ' . $error . "\n";
      }
  }
}
