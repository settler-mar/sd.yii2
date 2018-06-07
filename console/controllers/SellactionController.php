<?php

namespace console\controllers;


use yii\console\Controller;
use yii\helpers\Console;
use Yii;
use common\models\Sellaction;
use frontend\modules\stores\models\Cpa;
use frontend\modules\stores\models\CpaLink;
use frontend\modules\stores\models\Stores;
use frontend\modules\coupons\models\Coupons;
use frontend\modules\coupons\models\CategoriesCoupons;
use JBZoo\Image\Image;

class SellactionController extends Controller
{
    private $cpa;
    private $debug = true;
    private $categories;
    /**
     * Получение платежей
     */
    public function actionPayments()
    {
        //
    }

    public function actionTest()
    {
        $sellaction = new Sellaction();
        $response = $sellaction->campaigns(2, 20);
        ddd(count($response['data']), $response['_meta'], $response['_links']);
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

        $cpa = Cpa::find()->where(['name' => 'Cellaction'])->one();
        if (!$cpa) {
            echo 'Cpa type Cellaction not found';
            return;
        }
        $this->cpa = $cpa;

        $sellaction = new Sellaction();
        $page = 1;
        $pageCount = 2;
        do {
            $response = $sellaction->campaigns($page, $this->debug ? 5 : 50);
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

            $logo = explode("/", $store['logo']);
            $logo = 'cw_' . $logo[count($logo) - 1];

            $cpa_id = false;

            if ($cpa_link) {
                //если CPA link нашли то проверяем ссылку и при необходимости обновляем ее
                if ($cpa_link->affiliate_link != 'https://sellaction.net/?r=6bfa950dae1962d292') {
                    $cpa_link->affiliate_link = 'https://sellaction.net/?r=6bfa950dae1962d292';
                    $cpa_link->save();
                }

                $cpa_id = $cpa_link->id;

                //переходим от ссылки СПА на магазин
                $db_store = $cpa_link->store;
                if ($db_store && ($db_store->logo == $logo || !$db_store->logo)) {
                    $test_logo = true;
                } else {
                    $test_logo = false;
                }
            } else {
                $db_store = false;
                $test_logo = true;
            }

            $route = Yii::$app->help->str2url($store['name']);

            //если лого то проверяем его наличие и размер и при нобходимости обновляем
            if ($test_logo) {
                //обрабатываем лого
                $this->saveLogo($logo, $store['logo']);
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
                $db_store->short_description = $store['advantages_client'];
                $db_store->displayed_cashback = $conditions['cashback'];
                $db_store->conditions = $conditions['text'];
                $db_store->hold_time = (integer) $conditions['process'] > 0 ? (integer) $conditions['process'] : 30;
                if ($db_store->save()) {
                    $inserted++;
                } else {
                    d($db_store->errors);
                }
            }

            $store_id = $db_store->uid;

            //если нет в базе CPA ЛИНК то создаем ее
            if (!$cpa_id) {
                $cpa_link = new CpaLink();
                $cpa_link->cpa_id = $this->cpa->id;
                $cpa_link->stores_id = $store_id;
                $cpa_link->affiliate_id = $affiliate_id;
                $cpa_link->affiliate_link = 'https://sellaction.net/?r=6bfa950dae1962d292';
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
                $db_store->active_cpa = (int) $cpa_id;
            }
            if ($db_store->active_cpa == (int) $cpa_id) {
                // спа активная, обновляем поля - какие - можно потом добавить
                $db_store->url = $store['url'];
                //$db_store->logo = $test_logo && !empty($logo) ? $logo : $db_store->logo;
                //$db_store->description = $store['description'];
                //$db_store->short_description = $store['advantages_client'];
                //$db_store->displayed_cashback = $conditions['cashback'];
                //$db_store->conditions = $conditions['text'];
                //$db_store->hold_time = $conditions['process'] > 0 ? $conditions['process'] : 30;
                $db_store->coupon_description = print_r($store['categories'], true);
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
                $type = (string) $tariffItem['type'];
                $process = (integer) $tariffItem['processing_days'];
            }
            $text .= $tariffItem['name'].' - '.
                (float) $tariffItem['rate'] . ($tariffItem['type'] == 'percent' ?  ' %.' : ' '.$currency.'.').
                (isset($tariffItem['processing_days']) ? ' Время обработки ' . $tariffItem['processing_days'].' дней.' : '').
                '<br>';
        }
        return [
            'cashback' =>(count($tariffs) > 1 ? 'до ' : '') . $tariff . ($type == 'percent' ?  '%' : ''),
            'text' => $text,
            'process' => $process,
        ];
    }

    private function saveLogo($logo, $logoNew)
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
                $needUpdate =  (isset($imageSize[0]) && $imageSize[0] > 192) ||
                    (isset($imageSize[1]) && $imageSize[1] > 192);
            }
            if (!file_exists($path . $logo) || $needUpdate) {
                $file = file_get_contents($logoNew);
                $image = new Image($file);
                $image->bestFit(192, 192);
                $image->saveAs($path . $logo);
            }
        } catch (\Exception $e) {
            echo $e->getMessage()."\n";
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
            $cats = CategoriesCoupons::find()->select(['uid', 'name'])->asArray()->all();
            $this->categories = [];
            foreach ($cats as $cat) {
                $this->categories[$cat['name']] = $cat['uid'];
            }
        }
        $result = [];
        foreach ($categories as $category) {
            if (isset($this->categories[$category['name']])) {
                $result[] = $this->categories[$category['name']];
            }

        }
        d($result);
        return $result;
    }


}