<?php

namespace console\controllers;


use common\models\Actionpay;
use frontend\modules\stores\models\Cpa;
use frontend\modules\stores\models\Stores;
use yii\console\Controller;

//use frontend\modules\stores\models\CpaLink;

class ActionpayController extends Controller
{
  private $cpa_id;

  public function init()
  {
    $cpa = Cpa::find()->where(['name' => 'Actionpay'])->one();
    if (!$cpa) {
      echo "Cpa Actionpay not found";
      return;
    }
    $this->cpa_id = $cpa->id;
  }

  /*
   * Получить магазины с сервера
   */
  public function actionStores()
  {
    $service = new Actionpay();

    //ddd($service->getLinks(['offer' =>10336])); //dj.ru
    //ddd($service->getLinks(['offer' =>11701])); //яндекс маркет
    //ddd($service->getLinks(['offer' =>11844])); //iHerb

    $stores = $service->getMyStores();
    $stores = $stores['result']['favouriteOffers'];

    $storesAll = 0;
    $inserted = 0;
    $insertedCpaLink = 0;
    $errors = 0;
    $errorsCpaLink = 0;

    foreach ($stores as $store) {
      $storesAll++;

      //if($store['offer']['id']!=6174)continue;
      //d($store);
      $store = $service->getStores(['offer' => $store['offer']['id']]);
      $store = $store['result']['offers'][0];

      $cashBack = $this->getCashback($store);
      $gotolinks = $service->getLinks(['offer' => $store['id']]);
      $gotolinks = $gotolinks['result']['links'];
      $gotolink = false;
      $coupons = [];
      foreach ($gotolinks as $link) {
        if (!$link['landing']) continue;
        if ($link['cleanUrl'] == $store['link'] || $link['landing']['name'] == "Главная страница") {
          $gotolink = $link['url'];
          continue;
        }
        //isDefaulted - купон заканчивается в течении 2/х недель
        $coupons[] = [
          //'store_id' => $store->uid,
            'coupon_id' => $link['landing']['id'],
            'name' => $link['landing']['name'],
            'description' => "",
            'promocode' => "",
          //'date_start' => $coupon['date_start'],
          //'date_expire' => $coupon['date_end'],
            'link' => str_replace("subaccount","{{subid}}",$gotolink),
          //'exclusive' => $coupon['exclusive'] == 'true' ? 1 : 0,
          //'categories' => $coupon['categories'],
            'cpa_id' => $this->cpa_id,
        ];
      }

      if (!$gotolink) continue;
      if(!strpos($gotolink,"subaccount")) ddd($gotolink);
      $newStore = [
          'logo' => $store['logo'],
          'cpa_id' => $this->cpa_id,
          'affiliate_id' => $store['id'],
          'url' => $store['link'],
          'name' => $store['name'],
          'alias' => null,
          'currency' => $cashBack['currency'],
          'cashback' => $cashBack['cashback'],
          'hold_time' => $cashBack['diapazon']['hold']['max'] ? (int)$cashBack['diapazon']['hold']['max'] : 30,
          'affiliate_link' => $gotolink,
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
        'hold' => [
            'min' => false,
            'max' => false,
        ],
    ];
    $actions = [];
    $cur = false;
    $hasPersent = false;

    foreach ($store['aims'] as $aims) {
      $val=explode('-',$aims['price']);
      if(count($val)>2)continue;
      if(count($val)==2){
        $val_min=trim($val[0]);
        $val=$val[1];
      }else{
        $val=$val[0];
        $val_min=$val;
      }

      $val = $str = preg_replace("/[^0-9.]/", '', $val);
      $isPercentage = (strpos($aims['price'], "%") > 0);
      $hasPersent = $isPercentage || $hasPersent;

      $code = $isPercentage ? 'pers' : 'cash';
      if ($diapazon[$code]['min'] == false || $diapazon[$code]['min'] > $val_min) {
        $diapazon[$code]['min'] = $val_min;
      }
      if ($diapazon[$code]['max'] == false || $diapazon[$code]['max'] < $val) {
        $diapazon[$code]['max'] = $val;
      };

      if (!$cur) {
        $cur_t = str_replace('%', '', $aims['price']);
        $cur_t = trim(str_replace($val, '', $cur_t));
        if (strlen($cur_t) == 3) {
          $cur = $cur_t;
        };
      }

      $actions[] = [
          'action_id' => $aims['id'],
          'name' => $aims['name'],
          'hold_time' => $aims['hold'],
          'type' => 1,  // 0 = lead  1 = sale

          'tariffs' => [
              [
                  'tariff_id' => (int)$aims['tariff']['id'],
                  'name' => $aims['tariff']['name'],

                  'rates' => [
                      [
                          'rate_id' => $aims['id'], //внешний
                          'price_s' => 0, //для адма какая то хрень
                          'size' => $val,//размер без значения
                          'is_percentage' => $isPercentage,
                          'additional_id' => $aims['geo'],
                          'date_s' => date('Y-m-d'),
                      ]
                  ]
              ]
          ]
      ];

      $code = 'hold';
      $val = $aims['hold'];
      if ($diapazon[$code]['min'] == false || $diapazon[$code]['min'] > $val) {
        $diapazon[$code]['min'] = $val;
      }
      if ($diapazon[$code]['max'] == false || $diapazon[$code]['max'] < $val) {
        $diapazon[$code]['max'] = $val;
      };
    }

    $code = $hasPersent ? 'pers' : 'cash';
    $cashback = "";
    if ($diapazon[$code]['min'] < $diapazon[$code]['max']) {
      $cashback = "до ";
    }
    $cashback .= ($diapazon[$code]['max'] / 2) . ($hasPersent ? '%' : '');

    //d($aims);
    //d($cashback);
    //d($actions);
    return [
        'cashback' => $cashback,
        'actions' => $actions,
        'diapazon' => $diapazon,
        'hasParsent' => $hasPersent,
        'currency' => $cur,
    ];
  }
}