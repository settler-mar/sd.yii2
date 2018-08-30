<?php
namespace console\controllers;

use common\models\Advertise;
use yii\console\Controller;
use frontend\modules\stores\models\Cpa;
use frontend\modules\stores\models\Stores;
use yii;

class AdvertiseController extends Controller
{
    private $cpa;

    public function init()
    {
        $this->cpa = Cpa::findOne(['name' => 'Advertise']);
        if (!$this->cpa) {
            ddd('CPA Advertise not found');
        }
    }


  /**
   * Получение магазинов
   */
    public function actionStore()
    {
        $service = new Advertise();
        $storesCount = 0;
        $storesInserted = 0;
        $newCpa = 0;
        $cpaFails = 0;
        $storesFails = 0;

        $response = $service->offers();
        if (isset($response['response']['advcampaigns'])) {
            $storesCount = count($response['response']['advcampaigns']);
            foreach ($response['response']['advcampaigns'] as $offer) {
                //d($offer);
                $cashback = $this->getCashback($offer);
                $store = [
                    'logo' => $offer['logo'],
                    'cpa_id' => $this->cpa->id,
                    'affiliate_id' => $offer['id'],
                    'url' => $offer['site_url'],
                    'name' => $offer['name'],
                    'currency' => $cashback['currency'],
                    'cashback' => $cashback['cashback'],
                    'hold_time' => $offer['postclick_cookie'],
                    'description' => $offer['description'], //надо посмотреть что будет идти
                    'short_description' => $offer['short_description'],//надо посмотреть что будет идти
                    'conditions' => $offer['rules'],//надо посмотреть что будет идти
                    'status' => 1,
                    'affiliate_link' => 'http://glogo.ru/go/66bf13f70409426ba0eee42428aa9b3e365b64d1eb0a0b0b/?dpl=' .
                        $offer['site_url'],
                ];
                //d($store);
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
            }
        }
        echo 'Stores '.$storesCount."\n";
        echo 'Stores inserted '.$storesInserted."\n";
        if ($storesFails) {
            echo 'Stores fails '.$storesFails."\n";
        }
        echo 'Cpa Link inserted '.$newCpa."\n";
        if ($cpaFails) {
            echo 'Cpa Link fails '.$cpaFails."\n";
        }
    }

  /**
   * Получение купонов.
   */
  public function actionCoupons(){
    //https://advertise.ru/webmaster/api_manual/?action=discounts
    $service = new Advertise();
    ddd($service->coupons());
  }

    private function getCashback($offer)
    {
        $cashback = 0;
        $percent = false;
        $currency = '';
        if (isset($offer['actions'])) {
            foreach ($offer['actions'] as $action) {
                if ((float) $action['payment_size'] > $cashback) {
                    $cashback = (float) $action['payment_size'];
                    $percent = $action['percentage'];
                    $currency = $action['currency_id'];
                }
            }
        }
        return [
            'currency' => $currency,
            'cashback' => (count($offer['actions']) > 1 ? 'до ': ''). $cashback / 2 . ($percent ? '%':''),
        ];
    }


}