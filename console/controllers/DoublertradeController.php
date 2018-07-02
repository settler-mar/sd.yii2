<?php

namespace console\controllers;

use yii\console\Controller;
use yii\helpers\Console;
use Yii;
use frontend\modules\stores\models\Cpa;
use frontend\modules\stores\models\CpaLink;
use frontend\modules\stores\models\Stores;
use JBZoo\Image\Image;
use common\models\Doubletrade;

class DoublertradeController extends Controller
{
    private $cpa;
    private $stores;
    private $affiliate_list;
    private $inserted;
    private $insertedCpaLink;


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
            foreach ($offers['matrix']['rows']['row'] as $store) {
                $cashback =  is_array($store['programTariffAmount']) ? '' : ($store['programTariffAmount'] . (string) ($store['isPercentage'] == 'yes' ? '%' : ''));
                if (!isset($this->stores[$store['AdvertiserWebsite']])) {
                    $this->stores[$store['AdvertiserWebsite']] = $store;
                }
                if ($cashback != "") {
                    $this->stores[$store['AdvertiserWebsite']]['cashbacks'][] = [
                        'display' => $cashback,
                        'amount' => $store['programTariffAmount']
                    ];
                }
            }
            foreach ($this->stores as $store) {
                $this->writeStore($store);
            }
        }
        if (!empty($affiliate_list)) {
            $sql = "UPDATE `cw_stores` cws
            LEFT JOIN cw_cpa_link cpl on cpl.cpa_id=" . $cpa->id . " AND cws.`active_cpa`=cpl.id
            SET `is_active` = '0'
            WHERE cpl.affiliate_id NOT in(" . implode(',', $affiliate_list) . ") AND is_active!=-1";
            Yii::$app->db->createCommand($sql)->execute();
        }
        echo 'Stores '.count($offers['matrix']['rows']['row'])."\n";
        echo 'Stores Unique '.count($this->stores)."\n";
        echo 'Inserted '.$this->inserted."\n";
        echo 'InsertedCpaLink '.$this->insertedCpaLink."\n";

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

        $status = $store['status'] == "Accepted" ? 1 : 0;
        $cashback = $this->maxCashback($store['cashbacks']);

        $affiliate_id = $store['programId'];
        $this->affiliate_list[] = $affiliate_id;

        $cpa_link = CpaLink::findOne(['cpa_id' => $this->cpa->id, 'affiliate_id' => $affiliate_id]);

        $route = Yii::$app->help->str2url($store['programName']);

        $logo = explode(".", $store['logo']);
        $logo = 'cw' . $this->cpa->id . '_' .$route.'.'. $logo[count($logo) - 1];
        $logo = str_replace('_', '-', $logo);

        $cpa_id = false;

        if ($cpa_link) {
            //если CPA link нашли то проверяем ссылку и при необходимости обновляем ее
            if ($cpa_link->affiliate_link != $store['trackingURL']) {
                $cpa_link->affiliate_link = $store['trackingURL'];
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
                    strpos($db_store->logo, 'cw'.$this->cpa->id.'-') !== false ||
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
            $url = str_replace("https://", "%", $store['AdvertiserWebsite']);
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
            $db_store->name = $store['programName'];
            $db_store->route = $route;
            $db_store->url = $store['AdvertiserWebsite'];
            $db_store->logo = $logo;
            $db_store->currency = $store['programTariffCurrency'];
            $db_store->percent = 50;
            $db_store->hold_time =  $store['pendingPeriod'];
            $db_store->displayed_cashback = $cashback;
            $db_store->is_active = $status;
            if ($db_store->save()) {
                $this->inserted++;
            } else {
                d($db_store->errors);
            }
            echo $store['programName']. " ".$cashback. ' '. $status. "\n";
        }

        $store_id = $db_store->uid;

        //если нет в базе CPA ЛИНК то создаем ее
        if (!$cpa_id) {
            $cpa_link = new CpaLink();
            $cpa_link->cpa_id = $this->cpa->id;
            $cpa_link->stores_id = $store_id;
            $cpa_link->affiliate_id = $affiliate_id;
            $cpa_link->affiliate_link = $store['trackingURL'];
            if (!$cpa_link->save()) {
                return;
            }
            $this->insertedCpaLink++;

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
            $db_store->url = $store['AdvertiserWebsite'];
            $db_store->displayed_cashback = $cashback;
            $db_store->is_active = $status;
        }


        $db_store->url = $store['AdvertiserWebsite'];
        $db_store->save();
    }

    private function saveLogo($logo, $logoNew, $db_logo)
    {
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
            } else {
                return false;
            }
        } catch (\Exception $e) {
            echo $e->getMessage() . "\n";
            return false;
        }
    }

    private function maxCashback($cashbacks)
    {
        $amount = 0;
        $display = 0;
        foreach ($cashbacks as $cashback) {
            if ($cashback['amount'] > $amount) {
                $display = $cashback['display'];
                $amount = $cashback['amount'];
            }
        }
        return (count($cashbacks)>1 ? 'до ' : '') . $display;
    }



}