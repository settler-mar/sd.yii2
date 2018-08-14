<?php

namespace console\controllers;


use yii\console\Controller;
use Yii;
use common\models\Cj;
use frontend\modules\stores\models\Cpa;
use frontend\modules\stores\models\CpaLink;
use frontend\modules\stores\models\Stores;
use frontend\modules\coupons\models\Coupons;
use frontend\modules\coupons\models\CouponsToCategories;

class CjController extends Controller
{

    private $allLinksAsCoupon = true;//все ссылки загрузить как купоны
    private $cpa;
    private $siteId;//наш ид в cj.com
    private $trackingServer = 'https://www.qksrv.net';
    private $records;
    private $fails;
    private $inserted;
    private $cpaLinkInserted;
    private $cpaLinkFails;
    private $affiliateList = [];
    private $links;
    private $stores;
    private $categoriesConfigFile;
    private $categories = [];
    private $config;


    public function actionStores()
    {
        $this->cpa = Cpa::find()->where(['name' => 'Cj.com'])->one();
        if (!$this->cpa) {
            echo "Cpa Cj.com not found";
            return;
        }

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
        echo 'Stores '.$this->records."\n";
        if (!empty($this->fails)) {
            echo 'Errors '.$this->fails."\n";
        }
        echo 'Inserted '.$this->inserted."\n";
        echo 'Inserted Cpa link '.$this->cpaLinkInserted."\n";
        if (!empty($this->cpaLinkFails)) {
            echo 'Errors '.$this->cpaLinkFails."\n";
        }
    }



    public function actionPayments()
    {
        $cj = new Cj();
        $response = $cj->getPayments();
        d($response);
        $count = isset($response['commissions']['@attributes']['total-matched']) ?
            $response['commissions']['@attributes']['total-matched'] : false;
        d($count);

        if (isset($response['commissions']['commissions'])) {
            if ($count == 1) {
                $this->writePayment($response['commissions']['commissions']);
            } else {
                foreach ($response['commissions']['commissions'] as $commission) {
                    $this->writePayment($commission);
                }
            }
        }

    }

    private function writePayment($commission)
    {
        d($commission);
    }

    private function writeStore($store)
    {
//        $linkurl = $this->trackingServer . "/links/"  . $this->siteId . "/type/am/sid/{{subid}}/" .
//            $store['program-url'];
        $this->records++;
        $affiliate_id = (string) $store['advertiser-id'];
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

        $linkurl = $store['link']['clickUrl'];

        $this->affiliateList[] = $affiliate_id;
        $cashback = $this->getCashback($store);
        $storeNew = [
            'logo' => null,
            'cpa_id' => $this->cpa->id,
            'affiliate_id' => $affiliate_id,
            'url' => $storeUrl,
            'name' => (string) $store['advertiser-name'],
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
        $this->cpa = Cpa::find()->where(['name' => 'Cj.com'])->one();
        if (!$this->cpa) {
            echo "Cpa Cj.com not found";
            return;
        }
        $this->config = Yii::$app->params['cj.com'];
        if (!$this->config || !isset($this->config['categories_json'])) {
            echo "Config cj.com not found or cj.com->categories_json  not found";
            return;
        }

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
        echo "Coupons ". $this->records."\n";
        echo "Inserted ". $this->inserted."\n";
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

    private function getCashback($store){
        $actions = ($store['actions']['action']);
        $cashback=0;
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
            $valueFloat = (float) preg_replace('/[^0123456789\.]/', '', $valueValue);
            if ($valueFloat >= $cashbackValue) {
                $cashback = $valueValue;
                $cashbackValue = $valueFloat;
            }
            $currency = isset($valueArr[1]) ? $valueArr[0] : $currency;
        }
        $value = preg_replace('/[^0123456789\.]/', '', $cashback);
        $cashback = (string) ($value / 2) . (strpos($cashback, '%') && $value < 100 ? '%' : '');//value >=100 не может быть процент
        if (count($values)>1) {
            $cashback = 'до '.$cashback;
        }
        return ['cashback' => $cashback, 'currency'=>$currency];
    }

    private function writeCoupon($coupon)
    {
        if (empty($coupon['clickUrl'])) {
            return;
        }
        $this->records++;
        $store = $this->getStore($coupon['advertiser-id']);
        if (!$store) {
            d('Store not found '. $coupon['advertiser-id']);
            return;
        }
        $dbCoupon = Coupons::findOne(['coupon_id' => $coupon['link-id'], 'store_id' => $store->uid]);
        //Проверяем что б купон был новый
        if (!$dbCoupon) {
            $dbCoupon = new Coupons();
            $dbCoupon->coupon_id = $coupon['link-id'];
            $dbCoupon->name = $coupon['link-name'];
            $dbCoupon->description = !empty($coupon['description']) ? (string) $coupon['description'] : null;
            $dbCoupon->store_id = $store->uid;
            $dbCoupon->date_start = !empty($coupon['promotion-start-date']) ? (string) $coupon['promotion-start-date'] :
                date('Y-m-d 00:00:00');
            $dbCoupon->date_end = !empty($coupon['promotion-end-date']) ? (string) $coupon['promotion-end-date'] :
                date('Y-m-d H:i:s', PHP_INT_SIZE == 4 ? PHP_INT_MAX : PHP_INT_MAX>>32);
            $dbCoupon->goto_link = $coupon['clickUrl'];
            $dbCoupon->promocode = !empty($coupon['coupon-code']) ? (string) $coupon['coupon-code'] : '';
            $dbCoupon->species = 0;
            $dbCoupon->exclusive = 0;
            if (!$dbCoupon->save()) {
                d($dbCoupon->errors);
            } else {
                $this->inserted++;
            }
        } else {
            $dbCoupon->name = $coupon['link-name'];
            $dbCoupon->description = !empty($coupon['description']) ? (string) $coupon['description'] : $dbCoupon->description;
            $dbCoupon->date_start = !empty($coupon['promotion-start-date']) ? (string) $coupon['promotion-start-date'] :
                $dbCoupon->date_start;
            $dbCoupon->date_end = !empty($coupon['promotion-end-date']) ? (string) $coupon['promotion-end-date'] :
                $dbCoupon->date_end;
            $dbCoupon->goto_link = $coupon['clickUrl'];
            $dbCoupon->promocode = !empty($coupon['coupon-code']) ? (string) $coupon['coupon-code'] : '';
            if (!$dbCoupon->save()) {
                d($dbCoupon->errors);
            }
        }
        if ($dbCoupon->errors == null && !empty($coupon['category'])) {
            $categoryId = $this->getCouponCategory($coupon['category']);
            $couponToCategory = CouponsToCategories::findOne(['coupon_id' => $dbCoupon->uid, 'category_id' => $categoryId]);
            if (!$couponToCategory) {
                $couponToCategory = new CouponsToCategories();
                $couponToCategory->coupon_id = $dbCoupon->uid;
                $couponToCategory->category_id = $categoryId;
                $couponToCategory->save();
            }
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