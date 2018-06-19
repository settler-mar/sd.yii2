<?php

namespace console\controllers;

use common\components\Help;
use common\models\Rakute;
use Yii;
use yii\console\Controller;
use frontend\modules\stores\models\Stores;
use frontend\modules\stores\models\Cpa;
use frontend\modules\stores\models\CpaLink;
use frontend\modules\coupons\models\Coupons;
use frontend\modules\coupons\models\CouponsToCategories;

class RakuteController extends Controller
{

    private $affiliate_list;
    private $inserted = 0;
    private $updated = 0;
    private $coupons = 0;
    private $categories = [];
    private $categoriesConfigFile;
    private $stores;
    private $cpa;

    /**
     * шопы
     */
    public function actionStores()
    {
        $this->cpa = Cpa::find()->where(['name' => 'Rakuten'])->one();
        if (!$this->cpa) {
            echo "Cpa Rakuten not found";
            return;
        }
        $client = new Rakute();
        $linkResponse = $links = $client->getTextLinksByID('-1/-1/01012018/'.date('mdY', time()).'/-1/1');
        //cсылки по шопам  - каждому с максимальной датой
        $links = [];
        if (isset($linkResponse['return'])) {
            foreach ($linkResponse['return'] as $link) {
                if (!isset($links[$link['mid']]) || !isset($links[$link['mid']]['endDate'])) {
                    $links[$link['mid']] = $link;
                } else {
                    $dateLink = strtotime($links[$link['mid']]['endDate']);
                    $dateLinkNew = strtotime($link['endDate']);
                    if ($dateLinkNew > $dateLink) {
                        $links[$link['mid']] = $link;
                    }
                }
            }
        }
        $merchants = $client->merchantList();
        if (isset($merchants['midlist']['merchant'])) {
            foreach ($merchants['midlist']['merchant'] as $merchant) {

                //нам отcюда нужен бы статус, но запрос в цикле не проходит - превышено количество запросов в минуту
                //$merchantDetail = $client->getMerchByID($merchant['mid']);

                //if (isset($merchantDetail['return'])) {
                    $storeLink = isset($links[$merchant['mid']]) ? $links[$merchant['mid']] : false;
                    //$this->writeStore($merchantDetail['return'], $storeLink);
                    $this->writeStore($merchant, $storeLink);
                //}
            }
            echo 'Stores '. count($merchants['midlist']['merchant'])."\n";
            echo 'Inserted '.$this->inserted."\n";
            //echo 'Updated '.$this->updated."\n";
        }
    }

    /**
     * купоны
     */
    public function actionCoupons()
    {
        $perPage = 100;
        $pageNumber = 1;
        $pageCount = 1;

        $client = new Rakute();

        do {
            $coupons = $client->getCoupons(['resultsperpage' => $perPage, 'pagenumber' => $pageNumber]);
            $pageCount = isset($coupons['TotalPages']) ? (int)$coupons['TotalPages'] : $pageCount;
            $pageNumber = isset($coupons['PageNumberRequested']) ? (int)$coupons['PageNumberRequested'] : $pageNumber;
            $pageNumber++;
            if (isset($coupons['link'])) {
                foreach ($coupons['link'] as $link) {
                    $this->coupons++;
                    $this->writeCoupon($link);
                }
            }

        } while ($pageNumber <= $pageCount);

        $this->saveCategories();
        echo 'Coupons '. $this->coupons."\n";
        echo 'Inserted '.$this->inserted."\n";
    }


    /**
     * запись шопа
     * @param $merchant
     * @param $link
     */
    private function writeStore($merchant, $link)
    {
        //d($merchant, $link);
        $affiliate_id = $merchant['mid'];
        $this->affiliate_list[] = $affiliate_id;
        $merchant['currency'] = 'USD';
        $merchant['name'] = $merchant['merchantname'];
        //$status = $merchant['applicationStatus'] == 'Approved' ? 1 : 0;
        $status = 1;

        //поиск по ссылке по роуту
        $route = Yii::$app->help->str2url($merchant['name']);
        $db_store = Stores::find()->where(['route' => $route])->one();

        //Если магазин не нашли то создаем
        if (!$db_store) {
            $db_store = new Stores();
            $db_store->is_active = $status;
            $db_store->name = $merchant['name'];
            $db_store->route = $route;
            $db_store->url = '';
            $db_store->currency = $merchant['currency'];
            $db_store->percent = 50;
            $db_store->hold_time = 30;
            if ($db_store->save()) {
                $this->inserted++;
            } else {
                d($db_store->errors);
            }
        } else {
            if ($db_store->is_active != $status) {
                $db_store->is_active = $status;
                if ($db_store->save()) {
                    $this->updated++;
                } else {
                    d($db_store->errors);
                }
            }
        }
        if ($link) {
            $dbLink = CpaLink::find()->where(['cpa_id' => $this->cpa->id, 'stores_id' => $db_store->uid])->one();
            if (!$dbLink) {
                $dbLink =  new CpaLink();
                $dbLink->cpa_id = $this->cpa->id;
                $dbLink->stores_id = $db_store->uid;
                $dbLink->affiliate_id = $affiliate_id;
            }
            $dbLink->affiliate_link = $link['clickURL'];
            if (!$dbLink->save()) {
                d($dbLink->errors);
            }
            if (!$db_store->active_cpa || $db_store->active_cpa) {
                $db_store->active_cpa = $dbLink->id;
                if (!$db_store->save()) {
                    d($db_store->errors);
                }
            }
        }
    }

    /** запись купона
     * @param $coupon
     */
    private function writeCoupon($coupon) {
        $route = Yii::$app->help->str2url($coupon['advertisername']);
        $store = $this->getStore($route);
        if (!$store) {
            echo "Store ".$coupon['advertisername']." not found\n";
            return;
        }
        preg_match('/&offerid=(.*?)&/', $coupon['clickurl'], $matches);
        $couponId = str_replace('.', '', $matches[1]);

        $dbCoupon =  Coupons::find()->where(['store_id' => $store->uid, 'coupon_id' => $couponId])->one();
        if (!$dbCoupon) {
            $this->inserted++;
            $dbCoupon  = new Coupons();
            $dbCoupon->store_id = $store->uid;
            $dbCoupon->coupon_id = $couponId;
        }
        $couponName = $coupon['offerdescription'];
        $couponNameArr = explode(':', $couponName);
        $dbCoupon->name = $couponNameArr[0];
        $dbCoupon->description = isset($couponNameArr[1]) ? $couponNameArr[1] : '';
        $dbCoupon->goto_link = str_replace('&subid=0', '', $coupon['clickurl']);
        $dbCoupon->date_start = $coupon['offerstartdate'];
        $dbCoupon->date_end = $coupon['offerenddate'];
        $dbCoupon->species = 0;
        $dbCoupon->exclusive = 0;
        if (!$dbCoupon->save()) {
            d($dbCoupon->errors);
        }
        $categories = isset($coupon['categories']) ?
            $this->getCategories($coupon['categories']) : [];
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

    /**
     * получаем категории купонов
     * @param $categories
     * @return array
     */
    private function getCategories($categories)
    {
        if (!$this->categories) {
            $file = realpath(Yii::$app->basePath . '/../');
            $file .= Yii::$app->params['rakute']['categories_json'];
            $this->categoriesConfigFile = $file;
            if (file_exists($file)) {
                $this->categories = json_decode(file_get_contents($file), true);
            } else {
                $this->categories = [];
            }

        }
        $result = [];

        if (is_array($categories['category'])) {
            $cats = $categories['category'];
        } else {
            $cats = [$categories['category']];
        }
        foreach ($cats as $category) {
            if (!empty($this->categories[$category])) {
                $id = isset($this->categories[$category]['id']) ? $this->categories[$category]['id'] : false;
                if (is_array($id)) {
                    $result = array_merge($result, $id);
                } elseif ($id) {
                    $result[] = (integer)$id;
                }
            } else {
                //неизвестное значение - вписать в массив
                $this->categories[$category] = [
                    'name' => $category,
                ];
            }
        }
        return array_unique($result);
    }

    //сохранение категорий купонов для настройки в конфиг
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

    private function getStore($route)
    {
        if (!isset($this->stores[$route])) {
            $this->stores[$route] = Stores::find()->where(['route' => $route])->one();
        }
        return $this->stores[$route];
    }

}