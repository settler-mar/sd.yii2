<?php

namespace console\controllers;


use frontend\modules\payments\models\Payments;
use yii\console\Controller;
use Yii;
use common\models\Performancehorizon;
use frontend\modules\stores\models\Cpa;
use frontend\modules\stores\models\CpaLink;
use frontend\modules\stores\models\Stores;
use frontend\modules\users\models\Users;
use frontend\modules\actions\models\ActionsActions;

class PerformancehorizonController extends Controller
{

  //добавляем параметры для запуска
  public $day;

  private $cpa_id=-1;

  private $stores=array();
  private $users=array();

  public function init()
  {
    $cpa = Cpa::findOne(['name' => 'Performancehorizon']);
    if (!$cpa) {
      ddd('CPA Advertise not found');
    }

    $this->cpa_id=$cpa->id;
  }

  //добавляем параметры для запуска
  public function options($actionID)
  {
    if ($actionID == 'payments') {
      return ['day'];
    }
  }

  public function actionTest(){
    $t=new Performancehorizon();
    $t->test();
  }

  /**
   * Получает наш id магазина по внешнему id
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
   * Обновить шопы
   */
  public function actionStores(){
    $t=new Performancehorizon();
    $stores = $t->getStores();
    $storesCount = 0;
    $storesInserted = 0;
    $newCpa = 0;
    $cpaFails = 0;
    $storesFails = 0;

    $storesCount=count($stores["campaigns"]);
    foreach($stores["campaigns"] as $offer) {
      /*foreach($offer['campaign']['description'] as $code=>$r){
        echo $code."\n";
      }*/
      $offer = $offer['campaign'];

      $affiliate_id=explode('l',$offer['campaign_id']);
      $affiliate_id=$affiliate_id[1];
      $store = [
          'logo' => $offer['campaign_logo'],
          'cpa_id' => $this->cpa_id,
          'affiliate_id' => $affiliate_id,
          'url' => $offer['destination_url'],
          'name' => $offer['title'],
          'currency' => "USD", //в платежах есть
          'cashback' => "до " . $offer['default_commission_rate'] / 2,
          'hold_time' => 30,
          'description' => $offer['description']['ru'], //надо посмотреть что будет идти есть еще другие языки ru ko zh_hk en_us de es_mx fr zh_cn jp pt_br en en_ca
          'short_description' => $offer['terms']['ru']['terms'],
          'conditions' => "",//надо посмотреть что будет идти
          'status' => $offer['status'] == "a" ? 1 : 0,
          'affiliate_link' => $offer['tracking_link'] . '/pubref:{{subid}}',
      ];
      $result = Stores::addOrUpdate($store);
      if (!$result['result']) {
        $storesFails++;
      }
      if ($result['new']) {
        $storesInserted++;
      }
      if ($result['newCpa']) {
        $newCpa++;
        if (!$result['resultCpa']) {
          $cpaFails++;
        }
      }
      /*unset($offer['description']);
      unset($offer['terms']);
      d($offer);
      //d($store);/**/

      echo 'Stores ' . $storesCount . "\n";
      echo 'Stores inserted ' . $storesInserted . "\n";
      if ($storesFails) {
        echo 'Stores fails ' . $storesFails . "\n";
      }
      echo 'Cpa Link inserted ' . $newCpa . "\n";
      if ($cpaFails) {
        echo 'Cpa Link fails ' . $cpaFails . "\n";
      }
    }
  }

  /**
   * Обновить платежи
   */
  public function actionPayments($options = false, $send_mail = true, $day = false){
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
          $params['status_updated_start'] = date('Y-m-d H:i:s', time() - 86400 * $t[1]);
        }
      }
    } else {
      $params['status_updated_start'] = date('Y-m-d H:i:s', time() - 86400 * $days); //последнии 7 дней
      //$params['status_updated_end'] = date('d.m.Y 00:00:00');
    }

    if(is_numeric($params['status_updated_start']))$params['status_updated_start']=date('Y-m-d H:i:s',$params['status_updated_start']);
    if(isset($params['status_updated_end']) && is_numeric($params['status_updated_end']))$params['status_updated_end']=date('Y-m-d H:i:s',$params['status_updated_end']);

    //Проверить!!!
    $pay_status= [
        'pending' =>  0, //проверил 100%
        'declined' =>  1,
        'rejected' =>  1,//50/50
        'success' =>  2,//50/50
        'approved' =>  0,//50/50
    ];

    $users = array();
    //d($params);
    //ddd($params);
    $inserted = 0;
    $updated = 0;
    $paymentsCount = 0;

    $pf=new Performancehorizon();
    $payments = $pf->getPayments($params);
    while ($payments) {
      foreach ($payments['conversions'] as $payment) {
        $payment=$payment['conversion_data'];
        //ddd($payment);

        if (!$payment['publisher_reference'] || (int)$payment['publisher_reference'] == 0) {
          continue;
        }

        $adm_id=explode('l',$payment['campaign_id']);
        $adm_id=$adm_id[1];
        $store = $this->getStore($adm_id);
        $user = $this->getUserData($payment['publisher_reference']);

        if (!$store || !$user) {
          continue;
        }

        $status=$payment['conversion_items'][0]['item_status'];
        $status=isset($pay_status[$status]) ? $pay_status[$status] : 0;

        $action_id=explode('l',$payment['conversion_id']);
        $action_id=$action_id[1];

        $paymentsCount++;
        $payment_sd=[
          'cpa_id' => $this->cpa_id,
          'affiliate_id' => $adm_id,
          'subid'=>$user->uid,
          'action_id'=>$action_id,
          'status'=>$status,
          'ip'=>$payment['referer_ip'],
          'currency'=>$payment['currency'],//Валюта платежа
          'cart'=>$payment['conversion_value']['value'],  //Сумма заказа в валюте
          'payment'=>$payment['conversion_value']['publisher_commission'],  //Наш кешбек в валюте магазина
          'click_date'=>$payment['click']['set_time'],
          'action_date'=>$payment['conversion_time'],
          'status_updated'=>$payment['last_modified'],
          'closing_date'=>"",
          'order_id'=>(String)$payment["conversion_reference"],
          "tariff_id"=>"",
        ];

        //ddd($payment_sd);
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

      $params['limit']=$payments['limit'];
      $params['offset']=$payments['offset']+$params['limit'];
      if ($params['offset'] < $payments['count']) {
        $payments = $pf->getPayments($params);
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

      try {
        ActionsActions::observeActions($users);
      } catch (\Exception $e) {
        d('Error applying actions ' . $e->getMessage());
      }
    }
  }

}