<?php

namespace console\controllers;


use common\models\Cj;
use frontend\modules\actions\models\ActionsActions;
use frontend\modules\coupons\models\Coupons;
use frontend\modules\payments\models\Payments;
use frontend\modules\stores\models\Cpa;
use frontend\modules\stores\models\CpaLink;
use frontend\modules\stores\models\Stores;
use frontend\modules\users\models\Users;
use Yii;
use yii\console\Controller;

class CjController extends Controller
{

  private $allLinksAsCoupon = true;//все ссылки загрузить как купоны
  private $cpa;
  private $siteId;//наш ид в cj.com
  private $trackingServer = 'https://www.qksrv.net';
  private $records;
  private $fails;
  private $failsNotStore;
  private $failsNotUser;
  private $inserted;
  private $updated;
  private $cpaLinkInserted;
  private $cpaLinkFails;
  private $affiliateList = [];
  private $links;
  private $stores;
  private $categoriesConfigFile;
  private $categories = [];
  private $config;
  private $users=[];
  private $languages;

  public function init()
  {
    $this->cpa = Cpa::find()->where(['name' => 'Cj.com'])->one();
    if (!$this->cpa) {
      echo "Cpa Cj.com not found";
      return;
    }
  }


  public function actionStores()
  {
    $this->getJoinedLinks([]);

    $cj = new Cj();
    $page = 1;
    $pageCount = 1;
    $perPage = 100;
    do {
      $response = $cj->getJoined($page, $perPage);
      $page = isset($response['advertisers']['@attributes']['page-number']) ?
          $response['advertisers']['@attributes']['page-number'] : $page;
      $count = isset($response['advertisers']['@attributes']['records-returned']) ?
          $response['advertisers']['@attributes']['records-returned'] : 1;
      $all = isset($response['advertisers']['@attributes']['total-matched']) ?
          $response['advertisers']['@attributes']['total-matched'] : 1;
      $pageCount = (int)ceil($all / $perPage);
      if (isset($response['advertisers']['advertiser'])) {
        if ($count == 1) {
          $this->writeStore($response['advertisers']['advertiser']);
        } else {
          foreach ($response['advertisers']['advertiser'] as $store) {
            $this->writeStore($store);
          }
        }
      }
      $page++;
    } while ($page <= $pageCount);

    if (!empty($this->affiliateList)) {
      $sql = "UPDATE `cw_stores` cws
            LEFT JOIN cw_cpa_link cpl on cpl.cpa_id=" . $this->cpa->id . " AND cws.`active_cpa`=cpl.id
            SET `is_active` = '0'
            WHERE cpl.affiliate_id NOT in(" . implode(',', $this->affiliateList) . ") AND is_active!=-1";
      Yii::$app->db->createCommand($sql)->execute();
    }
    echo 'Stores ' . $this->records . "\n";
    if (!empty($this->fails)) {
      echo 'Errors ' . $this->fails . "\n";
    }
    echo 'Inserted ' . $this->inserted . "\n";
    echo 'Inserted Cpa link ' . $this->cpaLinkInserted . "\n";
    if (!empty($this->cpaLinkFails)) {
      echo 'Errors ' . $this->cpaLinkFails . "\n";
    }
  }


  public function actionPayments()
  {
    $cj = new Cj();
    $response = $cj->getPayments();
    $count = isset($response['count']) ? $response['count'] : 0;


    /*if (isset($response['commissions']['commission'])) {
      if ($count == 1) {
        $this->writePayment($response['commissions']['commission']);
      } else {*/
        if(empty($response['records'])){
          ddd($response);
        }else {
          foreach ($response['records'] as $commission) {
            $this->writePayment($commission);
          }
        }
    /*  }
    }*/

    echo 'Payments ' . $this->records . "\n";
    echo 'Inserted ' . $this->inserted . "\n";
    echo 'Updated ' . $this->updated . "\n";
    if ($this->failsNotStore) {
      echo 'Stores not found ' . $this->failsNotStore . "\n";
    }
    if ($this->failsNotUser) {
      echo 'Users not found ' . $this->failsNotUser . "\n";
    }
    //делаем пересчет бланса пользователей
    if (count($this->users) > 0) {
      $users = array_keys($this->users);
      Yii::$app->balanceCalc->setNotWork(false);
      Yii::$app->balanceCalc->todo($users, 'cash,bonus');

      try {
        ActionsActions::observeActions($users);
      } catch (\Exception $e) {
        d('Error applying actions ' . $e->getMessage());
      }
    }
  }

  private function writePayment($commission)
  {
    $this->records++;
    $pay_status = [
      //пока со всем этим непонятно
        'new' => 0,
        'extended' => 2,
        'closed' => 2,
        'locked' => 1,
    ];
    //d($commission);
    /*
    'actionTrackerName' => string (32) "Hotel Booking (International RS)"
    'actionStatus' => string (6) "closed"
    'reviewedStatus' => string (1) "0"
    'websiteId' => string (7) "8021356"
    'advertiserId' => string (7) "4347392"
    'clickDate' => string (20) "2019-03-12T07:37:01Z"
    'postingDate' => string (20) "2019-05-28T18:11:52Z"
    'commissionId' => string (10) "2483578977"
    'websiteName' => string (17) "Secret Discounter"
    'advertiserName' => string (28) "booking.com international RS"
    'pubCommissionAmountUsd' => string (7) "-51.826"
    'shopperId' => string (5) "95205"
    'saleAmountUsd' => string (9) "-1295.658"
    'orderId' => string (10) "1622592702"
    'items' => array (0)

    */
    $store = $this->getStore($commission['advertiserId']);
    if (!$store) {
      $this->failsNotStore++;
      return;
    }

    $orderCommission = abs($commission['pubCommissionAmountUsd']);
    /*if ($store->route == 'booking-com' && !(float)$orderCommission) {
      //для букинг пока так
      $orderCommission = $commission['sale-amount'] * 0.04;
      $status = 0;
    }*/

    if(empty($commission['shopperId']))return;
    $user = $this->getUser($commission['shopperId']);
    if (!$user) {
      $this->failsNotUser++;
      return;
    }

    $k = Yii::$app->conversion->getCurs($store->currency, 'USD');
    $status = isset($pay_status[$commission['actionStatus']]) ? $pay_status[$commission['actionStatus']] : 0;
    if(round($orderCommission*$k,2)<0.01){
      $status = 1;
    }



    $newPayment = [
        'cpa_id' => $this->cpa->id,
        'affiliate_id' => $commission['advertiserId'],
        'subid' => $user->uid,
        'action_id' => $commission['commissionId'],
        'status' => $status,
        'ip' => null,
        'currency' => $store->currency,//Валюта платежа
        'cart' => round(abs($commission['saleAmountUsd'])*$k,2),  //Сумма заказа в валюте
        'payment' => round($orderCommission*$k,2),  //комиссия в валюте магазина
        'click_date' => date('Y-m-d H:i:s', strtotime($commission['postingDate'])),
        'action_date' => date('Y-m-d H:i:s', strtotime($commission['postingDate'])),
        'status_updated' => date('Y-m-d H:i:s', strtotime($commission['postingDate'])),
        'closing_date' => "",
        'order_id' => (String)$commission["orderId"],
        "tariff_id" => null,
    ];

    $paymentStatus = Payments::makeOrUpdate(
        $newPayment,
        $store,
        $user,
        $user->referrer_id ? $this->getUser($user->referrer_id) : null,
        ['notify' => true, 'email' => true]
    );

    if ($paymentStatus['save_status']) {
      if ($paymentStatus['new_record']) {
        $this->inserted++;
      } else {
        $this->updated++;
      }
    }
  }

  private function writeStore($store)
  {
//        $linkurl = $this->trackingServer . "/links/"  . $this->siteId . "/type/am/sid/{{subid}}/" .
//            $store['program-url'];
    $this->records++;
    $affiliate_id = (string)$store['advertiser-id'];
    //ссылка для шопа
    //самая первая
    if (isset($this->links[$affiliate_id][0])) {
      $store['link'] = $this->links[$affiliate_id][0];
    }
    $storeUrl = preg_replace('/\/?\?.*/', '', $store['program-url']);

    $storeLink = strtolower(preg_replace('/^https?\:\/\//', '', $storeUrl));
    foreach ($this->links[$affiliate_id] as $link) {
      if (empty($link['clickUrl'])) {
        continue;
      }
      $destination = strtolower(preg_replace('/^https?\:\/\//', '', $link['destination']));
      if (strpos($destination, $storeLink)) {
        $store['link'] = $link;
      }
      //если есть ссылка на сам шоп, то меняем
      if ($storeLink == $destination) {
        $store['link'] = $link;
        break;
      }
    }

    if(!isset($store['link']))return;
    $linkurl = $store['link']['clickUrl'];

    $this->affiliateList[] = $affiliate_id;
    $cashback = $this->getCashback($store);
    $storeNew = [
        'logo' => null,
        'cpa_id' => $this->cpa->id,
        'affiliate_id' => $affiliate_id,
        'url' => $storeUrl,
        'name' => (string)$store['advertiser-name'],
        'currency' => $cashback['currency'] ? $cashback['currency'] : 'USD',
        'cashback' => $cashback['cashback'],
        'hold_time' => 30,
        'status' => 1,
        'affiliate_link' => $linkurl,
    ];
    $result = Stores::addOrUpdate($storeNew);

    if (!$result['result']) {
      $this->fails++;
    }
    if ($result['new']) {
      $this->inserted++;
    }
    if ($result['newCpa']) {
      $this->cpaLinkInserted++;
      if (!$result['resultCpa']) {
        $this->cpaLinkFails++;
      }
    }
  }

  public function actionCoupons()
  {
    $this->config = Yii::$app->params['cj.com'];
    if (!$this->config || !isset($this->config['categories_json'])) {
      echo "Config cj.com not found or cj.com->categories_json  not found";
      return;
    }
    $this->languages = array_flip(Yii::$app->languageDetector->getLanguages());

    $cj = new Cj();
    $page = 1;
    $pageCount = 1;
    $perPage = 100;
    do {
      $response = $cj->getLinks(
          $page,
          $perPage,
          //или все ссылки, или ссылки, названные у cj.com купонами
          $this->allLinksAsCoupon ? [] : ['promotion-type' => 'Coupon']
      );

      $page = isset($response['links']['@attributes']['page-number']) ?
          $response['links']['@attributes']['page-number'] : $page;
      $count = isset($response['links']['@attributes']['records-returned']) ?
          $response['links']['@attributes']['records-returned'] : 1;
      $all = isset($response['links']['@attributes']['total-matched']) ?
          $response['links']['@attributes']['total-matched'] : 1;
      $pageCount = (int)ceil($all / $perPage);
      if (isset($response['links']['link'])) {
        if ($count == 1) {
          $this->writeCoupon($response['links']['link']);
        } else {
          foreach ($response['links']['link'] as $link) {
            $this->writeCoupon($link);
          }
        }
      }
      $page++;
    } while ($page <= $pageCount);
    $this->saveCopuonCategory();
    echo "Coupons " . $this->records . "\n";
    echo "Inserted " . $this->inserted . "\n";
  }

  private function getJoinedLinks($options = [])
  {
    $cj = new Cj();
    $page = 1;
    $pageCount = 1;
    $perPage = 100;
    do {
      $response = $cj->getLinks($page, $perPage, $options);
      $page = isset($response['links']['@attributes']['page-number']) ?
          $response['links']['@attributes']['page-number'] : $page;
      $count = isset($response['links']['@attributes']['records-returned']) ?
          $response['links']['@attributes']['records-returned'] : 1;
      $all = isset($response['links']['@attributes']['total-matched']) ?
          $response['links']['@attributes']['total-matched'] : 1;
      $pageCount = (int)ceil($all / $perPage);
      if (isset($response['links']['link'])) {
        if ($count == 1) {
          $this->links[$response['links']['link']['advertiser-id']] = $response['links']['link'];
        } else {
          foreach ($response['links']['link'] as $link) {
            $this->links[$link['advertiser-id']][] = $link;
          }
        }
      }
      $page++;
    } while ($page <= $pageCount);
  }

  private function getCashback($store)
  {
    $actions = ($store['actions']['action']);
    $cashback = 0;
    $cashbackValue = 0;
    $currency = false;
    $values = [];
    if (isset($actions['commission'])) {
      if (isset($actions['commission']['itemlist'])) {
        foreach ($actions['commission']['itemlist'] as $item) {
          $values[] = $item;
        }
      }
      $values[] = $actions['commission']['default'];
    } else {
      foreach ($actions as $action) {
        if (isset($action['commission']['itemlist'])) {
          foreach ($action['commission']['itemlist'] as $item) {
            $values[] = $item;
          }
        }
        $values[] = $action['commission']['default'];
      }
    }
    foreach ($values as $value) {
      $valueArr = explode(' ', $value);
      $valueValue = isset($valueArr[1]) ? $valueArr[1] : $value;
      $valueFloat = (float)preg_replace('/[^0123456789\.]/', '', $valueValue);
      if ($valueFloat >= $cashbackValue) {
        $cashback = $valueValue;
        $cashbackValue = $valueFloat;
      }
      $currency = isset($valueArr[1]) ? $valueArr[0] : $currency;
    }
    $value = preg_replace('/[^0123456789\.]/', '', $cashback);
    $cashback = (string)($value / 2) . (strpos($cashback, '%') && $value < 100 ? '%' : '');//value >=100 не может быть процент
    if (count($values) > 1) {
      $cashback = 'до ' . $cashback;
    }
    return ['cashback' => $cashback, 'currency' => $currency];
  }

  private function writeCoupon($coupon)
  {
    if (empty($coupon['clickUrl'])) {
      return;
    }
    if (in_array($coupon['link-type'], ['Banner'])) {
        return;
    }
    $this->records++;
    $store = $this->getStore($coupon['advertiser-id']);
    if (!$store) {
      d('Store not found ' . $coupon['advertiser-id']);
      return;
    }

    $coupon['link-name'] = trim($coupon['link-name']);
    $name = strpos($coupon['link-name'], 'RU - ') === false ? $coupon['link-name'] :
        substr($coupon['link-name'], 5);
    $language = isset($coupon['language']) && isset($this->languages[$coupon['language']]) ?
        $this->languages[$coupon['language']] : null;

    $newCoupon = [
        'store_id' => $store->uid,
        'coupon_id' => $coupon['link-id'],
        'name' => $name,
        'description' => $coupon['description'],
        'promocode' => $coupon['coupon-code'],
        'date_start' => $coupon['promotion-start-date'],
        'date_expire' => $coupon['promotion-end-date'],
        'link' => $coupon['clickUrl'],
        'categories' => [$this->getCouponCategory($coupon['category'])],
        'cpa_id' => $this->cpa->id,
        'language' => $language,
    ];
    $result = Coupons::makeOrUpdate($newCoupon);
    if ($result['new']) {
      $this->inserted++;
    }
    if (!$result['status']) {
      d($newCoupon, $result['coupon']->errors);
    }
  }

  private function getStore($affiliateId)
  {
    if (!isset($this->stores[$affiliateId])) {
      $cpaLink = CpaLink::findOne(['cpa_id' => $this->cpa->id, 'affiliate_id' => $affiliateId]);
      $this->stores[$affiliateId] = $cpaLink ? $cpaLink->store : false;
    }
    return $this->stores[$affiliateId];
  }

  private function getUser($userId)
  {
    if (!isset($this->users[$userId])) {
      $user = Users::findOne(['uid' => $userId]);
      $this->users[$userId] = $user ? $user : false;
    }
    return $this->users[$userId];
  }

  private function getCouponCategory($category)
  {
    $result = false;
    if (!$this->categories) {
      $file = realpath(Yii::$app->basePath . '/../');
      $file .= $this->config['categories_json'];
      $this->categoriesConfigFile = $file;
      if (file_exists($file)) {
        $this->categories = json_decode(file_get_contents($file), true);
      } else {
        $this->categories = [];
      }

    }
    if (!empty($this->categories[$category])) {
      $result = isset($this->categories[$category]['id']) ? $this->categories[$category]['id'] : false;
    } else {
      //неизвестное значение - вписать в массив
      $this->categories[$category] = [
          'name' => $category,
      ];
    }

    return $result;
  }

  private function saveCopuonCategory()
  {
    if ($this->categoriesConfigFile) {
      file_put_contents($this->categoriesConfigFile, json_encode($this->categories));
    }
  }

}