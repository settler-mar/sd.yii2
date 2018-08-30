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
      ddd('CPA Sellaction not found');
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

    //https://sellaction.net/sellaction/doc/advertiser_api.php
    $pay_status = [
        0 =>0,//- ожидает
        1 =>2,// - подтвержден
        2 =>1,// - отменен
        3 =>0,// - ожидает подтверждения
        4 =>1,// - ожидает отмены
        5 =>0,// - оплачен
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
    $errors = 0;
    $errorsCpaLink = 0;

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
      $errors += $dataResult['errors'];
      $errorsCpaLink += $dataResult['errorsCpaLink'];

      echo 'Page ' . $page . ' of ' . $pageCount . ' records ' . count($response['data']) . "\n";
      $page++;
      if ($this->debug) {
        //для тестов - только один цикл
        $page = $pageCount + 1;
      }

    } while ($page <= $pageCount);

    if (!empty($affiliate_list)) {
      $sql = "UPDATE `cw_stores` cws
            LEFT JOIN cw_cpa_link cpl on cpl.cpa_id=" . $this->cpa_id . " AND cws.`active_cpa`=cpl.id
            SET `is_active` = '0'
            WHERE cpl.affiliate_id NOT in(" . implode(',', $affiliate_list) . ") AND is_active!=-1";
      Yii::$app->db->createCommand($sql)->execute();
    }
    $this->saveCategories();
    echo 'Stores ' . $records . "\n";
    echo 'Inserted ' . $inserted . "\n";
    if (!empty($errors)) {
        echo "Errors ".$errors."n";
    }
    echo 'Inserted Cpa link ' . $cpalinkInserted . "\n";
    if (!empty($errorsCpaLink)) {
      echo "Errors ".$errorsCpaLink."n";
    }
    echo 'Coupons ' . $countCoupons . "\n";
    echo 'Inserted ' . $insertedCoupons . "\n";
  }

  private function writeStores($data)
  {
    $inserted = 0;
    $insertedCpaLink = 0;
    $affiliate_list = [];
    $countCoupons = 0;
    $insertedCoupons = 0;
    $errors = 0;
    $errorsCpaLink = 0;

    foreach ($data as $store) {
      //d($store);
      $affiliate_id = $store['id'];
      $affiliate_list[] = $affiliate_id;
      $store['currency'] = $store['currency'] == 'RUR' ? 'RUB' : $store['currency'];
      $conditions = $this->getConditions($store['tariffs'], $store['currency']);
      $newStore = [
          'logo' => $store['logo'],
          'cpa_id' => $this->cpa_id,
          'affiliate_id' => $affiliate_id,
          'url' => $store['url'],
          'name' => $store['name'],
          'currency' => $store['currency'],
          'cashback' => $conditions['cashback'],
          'hold_time' => (integer)$conditions['process'] > 0 ? (integer)$conditions['process'] : 30,
          'description' => $store['description'],
          'short_description' => $store['short_description'] . '<br>' . $store['advantages_client'],
          'conditions' => $conditions['text'],
          'status' => 1,
          'affiliate_link' => $store['default_link'],
      ];

      $result = Stores::addOrUpdate($newStore);

      if (!$result['result']) {
        $errors++;
      }
      if ($result['new']) {
        $inserted++;
      }
      if ($result['newCpa']) {
        $insertedCpaLink++;
        if (!$result['resultCpa']) {
          $errorsCpaLink++;
        }
      }
      $coupons = $this->saveCoupons($result['store']->uid, $store);
      $countCoupons += $coupons['count'];
      $insertedCoupons += $coupons['inserted'];


    }
    return [
        'inserted' => $inserted,
        'affiliate_list' => $affiliate_list,
        'cpalinkInserted' => $insertedCpaLink,
        'couponsCount' => $countCoupons,
        'couponsInserted' => $insertedCoupons,
        'errors' => $errors,
        'errorsCpaLink' => $errorsCpaLink,
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

  private function saveCoupons($storeId, $store)
  {
    $count = 0;
    $inserted = 0;
    if (isset($store['coupons'])) {
      $categories = $this->getCategories($store['categories']);
      foreach ($store['coupons'] as $coupon) {
        $count++;
        $newCoupon = [
          'store_id' => $storeId,
          'coupon_id' => $coupon['id'],
          'name' => $coupon['name'],
          'description' => $coupon['description'],
          'promocode' => '',
          'date_start' => $coupon['date_start'],
          'date_expire' => $coupon['date_end'],
          'link' => $coupon['url'],
          'cpa_id' => $this->cpa_id,
          'exclusive' => 0,
          'categories' => $categories,
        ];
        $result = Coupons::makeOrUpdate($newCoupon);
        if ($result['new'] && $result['status']) {
          $inserted++;
        }
        if (!$result['status']) {
          d($coupon, $result['coupon']->errors);
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