<?php

namespace console\controllers;


use common\models\Shareasale;
use frontend\modules\actions\models\ActionsActions;
use frontend\modules\payments\models\Payments;
use frontend\modules\stores\models\Cpa;
use frontend\modules\stores\models\CpaLink;
use frontend\modules\stores\models\Stores;
use frontend\modules\users\models\Users;
use Yii;
use yii\console\Controller;

class ShareasaleController extends Controller
{

  private $cpa_id;
  private $users = [];
  private $stores = [];

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
   * Получает наш id магазина по id от Shareasale
   */
  private function getStore($adm_id)
  {
    $adm_id=(int)$adm_id;
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

  public function init()
  {
    $cpa = Cpa::find()->where(['name' => 'Shareasale'])->one();
    if (!$cpa) {
      echo 'Cpa type Shareasale not found';
      return;
    }
    $this->cpa_id = $cpa->id;
  }

  /**
   * Получение платежей
   */
  public function actionPayments()
  {
    $status_list=[
      "Transaction Created"=>0,//Заказ создан
    ];
    $shareasale = new Shareasale();
    $payments = $shareasale->getActivity();
    $users = [];
    $noUser = 0;
    $records = 0;
    $inserted = 0;
    $updated = 0;
    foreach ($payments as $payment) {
      d($payment);
      $records++;
      $user = $this->getUserData((string)$payment['afftrack']);
      if ($user == false) {
        $noUser++;
        continue;
      }
      $store = $this->getStore($payment['merchantid']);
      if ($store == false) {
        continue;
      }

      $payment = [
          'status' => isset($status_list[$payment['action']])? $status_list[$payment['action']]: 0,
          'subid' => $user->uid,
          'positions' => false, //для тарифа, видимо так
          'action_id' => (string)$payment['ledgerid'],
          'cart' => 0,
          'payment' => (float)$payment['impact'],
          'click_date' => date('Y-m-d H:i:s', strtotime($payment['dt'])),
          'action_date' => date('Y-m-d H:i:s', strtotime($payment['dt'])),
          'status_updated' => date('Y-m-d H:i:s', strtotime($payment['dt'])),
          'closing_date' => date('Y-m-d H:i:s', strtotime($payment['dt'])), //??
          'product_country_code' => null,
          'order_id' => (string)$payment['comment'],// тоже под вопросом??
          'tariff_id' => null,
          'currency' => $store->currency,
          'affiliate_id' => $payment['merchantid'],
          'cpa_id' => $this->cpa_id
      ];

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
        if (!in_array($user->uid, $users)) {
          $users[] = $user->uid;
        }
      }
    }

    echo 'Payments ' . $records . "\n";
    if ($noUser) {
      echo 'User not found ' . $noUser . "\n";
    }
    echo 'Inserted ' . $inserted . "\n";
    echo 'Updated ' . $updated . "\n";
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


  /*
   * Получение купонов
   */
  public function actionCoupons(){
    $shareasale = new Shareasale();
    $coupons = $shareasale->getCoupons();
    ddd($coupons[0]);
  }

  /**
   * получение шопов
   */
  public function actionStore()
  {
    $ids = [];
    $affiliate_list = [];
    $records = 0;
    $inserted = 0;
    $cpalinkInserted = 0;
    $storesFails = 0;
    $cpalinkErrors = 0;

    $shareasale = new Shareasale();
    $merchants = $shareasale->getJoinedMerchants();

    foreach ($merchants as $merchant) {
      $ids[] = $merchant->merchantid;
    }

    while (!empty($ids)) {
      //разбиваем массив ид на части, делаем запрос по частям чтобы не превысить длину get
      $idsPart = array_slice($ids, 0, 50);
      $ids = array_diff($ids, $idsPart);

      $merchantDetails = $shareasale->getMerchantsDetails(implode(',', $idsPart));

      foreach ($merchantDetails as $store) {
        $records++;
        $affiliate_id = (string)$store->merchantid;
        $affiliate_list[] = $affiliate_id;
        $cashback = $store->salecomm;
        $value = (float)preg_replace('/[^0123456789\.\,]/', '', $cashback) / 2;
        $cashbackClean = $value . (strpos($cashback, '%') > 0 ? '%' : '');
        $newStore = [
            'cpa_id' => $this->cpa_id,
            'affiliate_id' => $affiliate_id,
            'url' => (string)$store->www,
            'name' => (string)$store->merchant,
            'currency' => 'USD',
            'cashback' => $cashbackClean,
            'hold_time' => 30,
            'status' => 1,
            'affiliate_link' => (string)$store->linkurl,
        ];
        $result = Stores::addOrUpdate($newStore);

        if (!$result['result']) {
          $storesFails++;
        }
        if ($result['new']) {
          $inserted++;
        }
        if ($result['newCpa']) {
          $cpalinkInserted++;
          if (!$result['resultCpa']) {
            $cpalinkErrors++;
          }
        }
      }
    }
    if (!empty($affiliate_list)) {
      $sql = "UPDATE `cw_stores` cws
            LEFT JOIN cw_cpa_link cpl on cpl.cpa_id=" . $this->cpa_id . " AND cws.`active_cpa`=cpl.id
            SET `is_active` = '0'
            WHERE cpl.affiliate_id NOT in(" . implode(',', $affiliate_list) . ") AND is_active!=-1";
      Yii::$app->db->createCommand($sql)->execute();
    }
    echo 'Stores ' . $records . "\n";
    echo 'Inserted ' . $inserted . "\n";
    if (!empty($errors)) {
      echo 'Stores fails ' . $errors . "\n";
    }
    echo 'Inserted Cpa link ' . $cpalinkInserted . "\n";
    if (!empty($cpalinkErrors)) {
      echo 'Cpa link fails ' . $cpalinkErrors . "\n";
    }
  }

  public function actionProduct()
  {
      $shareasale = new Shareasale();
      $products = $shareasale->getProducts();
      ddd($products);
  }


}