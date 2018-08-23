<?php

namespace console\controllers;


use frontend\modules\actions\models\ActionsActions;
use frontend\modules\payments\models\Payments;
use yii\console\Controller;
use yii\helpers\Console;
use Yii;
use common\models\Sellaction;
use frontend\modules\stores\models\Cpa;
use frontend\modules\stores\models\CpaLink;
use frontend\modules\stores\models\Stores;
use frontend\modules\coupons\models\Coupons;
use frontend\modules\coupons\models\CouponsToCategories;
use JBZoo\Image\Image;
use frontend\modules\users\models\Users;

class SellactionController extends Controller
{
  private $cpa_id =-1;
  private $debug = false;
  private $categories;
  private $categoriesConfigFile;

  private $stores = array();
  private $users = array();


  public function init()
  {
    $cpa = Cpa::findOne(['name' => 'Sellaction']);
    if (!$cpa) {
      ddd('CPA Advertise not found');
    }

    $this->cpa_id = $cpa->id;
  }


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
   * Получение платежей
   */
  public function actionPayments()
  {

    $sellaction = new Sellaction();

    $inserted = 0;
    $updated = 0;
    $paymentsCount = 0;

    $pay_status = [
        'wait' => 0, //проверил 100% ожидание

    ];

    $users=array();
    $page=0;
    $page_cnt=0;
    while ($page==0 || $page<$page_cnt){
      $page++;
      $payments = $sellaction->lostOrders($page);
      $page_cnt=$payments['_meta']['pageCount'];

      foreach ($payments['data'] as $payment){
        //d($payment);

        $store = $this->getStore($payment['campaign_id']);
        $user = $this->getUserData($payment['sub_id1']);

        if (!$store || !$user) {
          continue;
        }

        $status = $payment['status_string'];
        $status = isset($pay_status[$status]) ? $pay_status[$status] : 0;

        $paymentsCount++;
        $payment_sd = [
            'cpa_id' => $this->cpa_id,
            'affiliate_id' => $payment['campaign_id'],
            'subid' => $user->uid,
            'action_id' => $payment['id'],
            'status' => $status,
            'ip' => $payment['ip'],
            'currency' => $payment['currency'],//Валюта платежа
            'cart' => $payment['buy_sum'],  //Сумма заказа в валюте
            'payment' => $payment['profit'],  //Наш кешбек в валюте магазина
            'click_date' => $payment['click_date'].' '.$payment['click_time'],
            'action_date' => $payment['click_date'].' '.$payment['click_time'],
            'status_updated' => $payment['date'].' '.$payment['time'],
            'closing_date' => "",
            'order_id' => (String)$payment["order_id"],
            "tariff_id" => $payment['tariff_id'],
        ];

        $paymentStatus = Payments::makeOrUpdate(
            $payment_sd,
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
    }

    echo 'Payments ' . $paymentsCount . "\n";
    echo 'Inserted ' . $inserted . "\n";
    echo 'Updated ' . $updated . "\n";
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

  public function actionTest()
  {
    $sellaction = new Sellaction();
    $response = $sellaction->actions(1, 10);
    ddd($response, $response['data'], $response['_meta'], $response['_links']);
  }

  /**
   * получение шопов ?? купонов в куче
   */
  public function actionStore()
  {
    $ids = [];
    $affiliate_list = [];
    $records = 0;
    $inserted = 0;
    $cpalinkInserted = 0;
    $countCoupons = 0;
    $insertedCoupons = 0;

    $cpa = Cpa::find()->where(['name' => 'Sellaction'])->one();
    if (!$cpa) {
      echo 'Cpa type Cellaction not found';
      return;
    }
    $this->cpa = $cpa;

    $sellaction = new Sellaction();
    $page = 1;
    $pageCount = 2;
    do {
      $response = $sellaction->myCampaigns($page, $this->debug ? 5 : 50);
      if (!isset($response['_meta'])) {
        $page = $pageCount;
      } else {
        $meta = $response['_meta'];
        $pageCount = (isset($meta['pageCount']) ? $meta['pageCount'] : 1);
        $page = (isset($meta['currentPage']) ? $meta['currentPage'] : 1);
      }

      $records += count($response['data']);

      $dataResult = $this->writeStores($response['data']);

      $inserted += $dataResult['inserted'];
      $affiliate_list = array_merge($affiliate_list, $dataResult['affiliate_list']);
      $cpalinkInserted += $dataResult['cpalinkInserted'];
      $countCoupons += $dataResult['couponsCount'];
      $insertedCoupons += $dataResult['couponsInserted'];

      echo 'Page ' . $page . ' of ' . $pageCount . ' records ' . count($response['data']) . "\n";
      $page++;
      if ($this->debug) {
        //для тестов - только один цикл
        $page = $pageCount + 1;
      }

    } while ($page <= $pageCount);

    if (!empty($affiliate_list)) {
      $sql = "UPDATE `cw_stores` cws
            LEFT JOIN cw_cpa_link cpl on cpl.cpa_id=" . $cpa->id . " AND cws.`active_cpa`=cpl.id
            SET `is_active` = '0'
            WHERE cpl.affiliate_id NOT in(" . implode(',', $affiliate_list) . ") AND is_active!=-1";
      Yii::$app->db->createCommand($sql)->execute();
    }
    $this->saveCategories();
    echo 'Stores ' . $records . "\n";
    echo 'Inserted ' . $inserted . "\n";
    echo 'Inserted Cpa link ' . $cpalinkInserted . "\n";
    echo 'Coupons ' . $countCoupons . "\n";
    echo 'Inserted ' . $insertedCoupons . "\n";
  }

  private function writeStores($data)
  {
    $inserted = 0;
    $insertedCpalink = 0;
    $affiliate_list = [];
    $countCoupons = 0;
    $insertedCoupons = 0;

    foreach ($data as $store) {
      //d($store);
      $affiliate_id = $store['id'];
      $affiliate_list[] = $affiliate_id;
      $store['currency'] = $store['currency'] == 'RUR' ? 'RUB' : $store['currency'];

      $cpa_link = CpaLink::findOne(['cpa_id' => $this->cpa->id, 'affiliate_id' => $affiliate_id]);

      $route = Yii::$app->help->str2url($store['name']);

      $logo = explode(".", $store['logo']);
      $logo = 'cw' . $this->cpa->id . '_' .$route.'.'. $logo[count($logo) - 1];
      $logo = str_replace('_','-',$logo);

      $cpa_id = false;

      if ($cpa_link) {
        //если CPA link нашли то проверяем ссылку и при необходимости обновляем ее
        if ($cpa_link->affiliate_link != $store['default_link']) {
          $cpa_link->affiliate_link = $store['default_link'];
          $cpa_link->save();
        }

        $cpa_id = $cpa_link->id;

        //переходим от ссылки СПА на магазин
        $db_store = $cpa_link->store;

        /*
         * Лого обновляем если
         * - лого был прописан данной CPA (тут подумать еще)
         * - нет лого
         * - лого от адмитада
         */

        if ($db_store && (
            $db_store->logo == $logo ||
            !$db_store->logo ||
            strpos($db_store->logo, 'cw1-') !== false ||
            strpos($db_store->logo, 'cw'.$this->cpa_id.'-') !== false ||
            strpos($db_store->logo, 'cw_') !== false
            )) {
          $test_logo = true;
        } else {
          $test_logo = false;
        }
      } else {
        $db_store = false;
        $test_logo = true;
      }


      //если лого то проверяем его наличие и размер и при нобходимости обновляем
      if ($test_logo) {
        //обрабатываем лого и если обновление то меняем имя
        if($this->saveLogo($logo, $store['logo'], $db_store ? $db_store->logo : false) && $db_store){
          $db_store->logo=$logo;
        };
      }

      //если магазин не нашли по прямому подключению пробуем найти по косвеным признакам

      //поиск по ссылке на магазин
      if (!$db_store) {
        //Проверяем существования магазина на основании его адреса
        //чистим URL
        $url = str_replace("https://", "%", $store['url']);
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

      $conditions = $this->getConditions($store['tariffs'], $store['currency']);

      //Если магазин так и не нашли то создаем
      if (!$db_store) {
        $db_store = new Stores();
        $db_store->name = $store['name'];
        //    if (isset($store['name_aliases'])) {
        //          $db_store->alias = $store['name_aliases'];
        //     };
        $db_store->route = $route;
        $db_store->url = $store['url'];
        $db_store->logo = $logo;
        $db_store->currency = $store['currency'];
        $db_store->percent = 50;
        $db_store->description = $store['description'];
        $db_store->short_description = $store['short_description'] . '<br>' . $store['advantages_client'];
        $db_store->displayed_cashback = $conditions['cashback'];
        $db_store->conditions = $conditions['text'];
        $db_store->hold_time = (integer)$conditions['process'] > 0 ? (integer)$conditions['process'] : 30;
        if ($db_store->save()) {
          $inserted++;
        } else {
          d($db_store->errors);
        }
      }

      $store_id = $db_store->uid;

      //$db_store->displayed_cashback = $conditions['cashback']; //перезаписываем кешбек

      //если нет в базе CPA ЛИНК то создаем ее
      if (!$cpa_id) {
        $cpa_link = new CpaLink();
        $cpa_link->cpa_id = $this->cpa_id;
        $cpa_link->stores_id = $store_id;
        $cpa_link->affiliate_id = $affiliate_id;
        $cpa_link->affiliate_link = $store['default_link'];
        if (!$cpa_link->save()) continue;
        $insertedCpalink++;

        $cpa_id = $cpa_link->id;
      } else {
        //проверяем свяль CPA линк и магазина
        if ($cpa_link->stores_id != $store_id) {
          $cpa_link->stores_id = $store_id;
          $cpa_link->save();
        }
      }

      //если СPA не выбранна то выставляем текущую
      if ((int)$db_store->active_cpa == 0 || empty($db_store->active_cpa)) {
        $db_store->active_cpa = (int)$cpa_id;
      }
      if ($db_store->active_cpa == (int)$cpa_id) {
        // спа активная, обновляем поля - какие - можно потом добавить
        $db_store->url = $store['url'];
        //$db_store->logo = $test_logo && !empty($logo) ? $logo : $db_store->logo;
        //$db_store->description = $store['description'];
        //$db_store->short_description = $store['advantages_client'];
        //$db_store->displayed_cashback = $conditions['cashback'];
        //$db_store->conditions = $conditions['text'];
        //$db_store->hold_time = $conditions['process'] > 0 ? $conditions['process'] : 30;
      }

      //надо определиться с полями, которые обновлять


      $db_store->url = $store['url'];
      if ($db_store->is_active != -1) {
        $db_store->is_active = 1;
      }
      $db_store->save();
      $coupons = $this->saveCoupons($db_store->uid, $store);
      $countCoupons += $coupons['count'];
      $insertedCoupons += $coupons['inserted'];


    }
    return [
        'inserted' => $inserted,
        'affiliate_list' => $affiliate_list,
        'cpalinkInserted' => $insertedCpalink,
        'couponsCount' => $countCoupons,
        'couponsInserted' => $insertedCoupons,
    ];
  }

  /**
   * вычисление то что из тарифов
   * @param $tariffs
   * @return array
   */
  private function getConditions($tariffs, $currency)
  {
    $tariff = 0;
    $type = '';
    $process = 0;
    $text = 'Тарифы:<br>';
    foreach ($tariffs as $tariffItem) {
      if ((float)$tariffItem['rate'] > $tariff) {
        $tariff = (float)$tariffItem['rate'];
        $type = (string)$tariffItem['type'];
        $process = (integer)$tariffItem['processing_days'];
      }
      $text .= $tariffItem['name'] . ' - ' .
          (float)$tariffItem['rate'] . ($tariffItem['type'] == 'percent' ? ' %.' : ' ' . $currency . '.') .
          (isset($tariffItem['processing_days']) ? ' Время обработки ' . $tariffItem['processing_days'] . ' дней.' : '') .
          '<br>';
    }
    $tariff=$tariff/2;
    return [
        'cashback' => (count($tariffs) > 1 ? 'до ' : '') . $tariff . ($type == 'percent' ? '%' : ''),
        'text' => $text,
        'process' => $process,
    ];
  }

  private function saveLogo($logo, $logoNew, $db_logo)
  {
    //d([$logo,$logoNew]);
    $needUpdate = false;
    $path = Yii::$app->getBasePath() . '/../frontend/web/images/logos/';
    if (!file_exists($path)) {
      mkdir($path, 0777, true);
    }
    //echo $path .' '.$logo.' '.$logoNew."\n";
    try {
      if (file_exists($path . $logo)) {
        $imageSize = getimagesize($path . $logo);
        $needUpdate = (isset($imageSize[0]) && $imageSize[0] < 192) ||
            (isset($imageSize[1]) && $imageSize[1] < 192);
      }
      //d($needUpdate);
      if (!file_exists($path . $logo) || $needUpdate) {
        if ($db_logo && file_exists($path . $db_logo)) {
          unlink($path . $db_logo);
        }
        $file = file_get_contents($logoNew);
        $image = new Image($file);
        $image->bestFit(192, 192);
        $image->saveAs($path . $logo);
        return true;
      }else{
        return false;
      }
    } catch (\Exception $e) {
      echo $e->getMessage() . "\n";
      return false;
    }
  }

  private function saveCoupons($storeId, $store)
  {
    $count = 0;
    $inserted = 0;
    if (isset($store['coupons'])) {
      $categories = $this->getCategories($store['categories']);
      foreach ($store['coupons'] as $coupon) {
        $count++;
        $dbCoupon = Coupons::find()->where(['store_id' => $storeId, 'coupon_id' => $coupon ['id']])->one();
        if (!$dbCoupon) {
          $inserted++;
          $dbCoupon = new Coupons;
          $dbCoupon->store_id = $storeId;
          $dbCoupon->coupon_id = $coupon['id'];
        }
        $dbCoupon->name = $coupon['name'];
        $dbCoupon->description = $coupon['description'];
        $dbCoupon->goto_link = $coupon['url'];
        $dbCoupon->date_start = $coupon['date_start'];
        $dbCoupon->date_end = $coupon['date_end'];
        $dbCoupon->species = 0;
        $dbCoupon->exclusive = 0;
        //$coupon['type'] campaign discount  - нет полей куда и зачем положить
        if (!$dbCoupon->save()) {
          d($dbCoupon->errors);
        }
        //категории  к купону
        //d($dbCoupon->uid, $store['categories'], $categories);
        foreach ($categories as $category) {
          $categoryCoupon = CouponsToCategories::find()
              ->where(['coupon_id' => $dbCoupon->uid, 'category_id' => $category])
              ->one();
          if (!$categoryCoupon) {
            $categoryCoupon = new CouponsToCategories();
            $categoryCoupon->coupon_id = $dbCoupon->uid;
            $categoryCoupon->category_id = $category;
            if (!$categoryCoupon->save()) {
              d($categoryCoupon->errors);
            }
          }
        }
      }
    }
    return [
        'count' => $count,
        'inserted' => $inserted,
    ];
  }

  private function getCategories($categories)
  {
    if (!$this->categories) {
      $file = realpath(Yii::$app->basePath . '/../');
      $file .= Yii::$app->params['sellaction']['categories_json'];
      $this->categoriesConfigFile = $file;
      if (file_exists($file)) {
        $this->categories = json_decode(file_get_contents($file), true);
      } else {
          $this->categories = [];
      }

    }
    $result = [];
    foreach ($categories as $category) {
      if (!empty($this->categories[$category['id']]['id'])) {
        $id = $this->categories[$category['id']]['id'];
        if (is_array($id)) {
          $result = array_merge($result, $id);
        } else {
          $result[] = (integer)$id;
        }
      } else {
          //неизвестное значение - вписать в массив
         $this->categories[$category['id']] = [
           'name' => $category['name']
         ];
      }
    }
    return array_unique($result);
  }

  private function saveCategories()
  {
      $categories = !empty($this->categories) ? json_encode($this->categories) : false;
      $fileArray = explode('/', $this->categoriesConfigFile);
      $filePath = implode('/', array_slice($fileArray, 0, count($fileArray) - 1));
      if (!file_exists($filePath)) {
          mkdir($filePath, 0777, true);
      }
      if ($categories && $this->categoriesConfigFile) {
          file_put_contents($this->categoriesConfigFile, $categories);
      }
  }


}