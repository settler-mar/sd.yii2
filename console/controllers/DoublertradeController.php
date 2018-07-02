<?php

namespace console\controllers;

use yii\console\Controller;
use yii\helpers\Console;
use Yii;
use frontend\modules\stores\models\Cpa;
use frontend\modules\stores\models\Stores;

use common\models\Doubletrade;

class DoublertradeController extends Controller
{
    private $cpa;
    private $stores;


    public function actionOffers()
    {
        $cpa = Cpa::find()->where(['name' => 'Doublertrade'])->one();
        if (!$cpa) {
            echo 'Cpa type Doublertrade not found';
            return;
        }
        $this->cpa = $cpa;

        $service = new DoubleTrade();

        $offers = $service->offers();

        if (isset($offers['matrix']['rows']['row'])) {
            echo 'stores '.count($offers['matrix']['rows']['row'])."\n";
            foreach ($offers['matrix']['rows']['row'] as $store) {
                $this->writeStore($store);
            }
        }
    }

    public function actionVouchers()
    {
        $service = new DoubleTrade();

        ddd($service->vouchers());
    }

    public function actionOrders()
    {
        $service = new DoubleTrade();

        ddd($service->conversions());
    }

    private function writeStore($store)
    {
        /*
    'programName' => string (7) "Bonprix"
    'AdvertiserWebsite' => string (22) "http://www.bonprix.ru/"
    'programId' => string (6) "232132"
    'logo' => string (55) "http://hst.tradedoubler.com/file/232132/logo_200x70.jpg"
    'trackingURL' => string (66) "https://clkru.tradedoubler.com/click?p=232132&a=3044873&g=21195984"
    'status' => string (8) "Accepted" "Not Applied" "Under Consideration"
    'pendingPeriod' => string (2) "65"
    'cookieLifetime' => string (2) "14"
    'trafficSources' => array (9) [
        'voucher' => string (3) "yes"
        'cashback' => string (3) "yes"
        'loyalty' => string (2) "no"
        'email' => string (3) "yes"
        'social' => string (2) "no"
        'search' => string (2) "no"
        'brandsearch' => string (2) "no"
        'retargeting' => string (2) "no"
        'pricecomparison' => string (2) "no"
    ]
    'segmentName' => string (7) "General"
    'event' => string (12) "Bonprix_Sale"
    'eventIdView' => string (6) "260730"
    'programTariffCurrency' => string (3) "RUB"
    'programTariffAmount' => string (4) "6.52"
    'isPercentage' => string (3) "yes"
          */

        //d($store)
        if ($store['status'] == 'Accepted') {
            ddd($store);
        }
    }

//    private function getStore($route)
//    {
//        if (!isset($this->stores[$route])) {
//
//        }
//        return $this->stores[$route];
//    }



}