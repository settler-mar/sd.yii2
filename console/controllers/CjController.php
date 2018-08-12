<?php

namespace console\controllers;


use yii\console\Controller;
use Yii;
use common\models\Cj;
use frontend\modules\stores\models\Cpa;
use frontend\modules\stores\models\CpaLink;
use frontend\modules\stores\models\Stores;

class CjController extends Controller
{

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


    public function actionStores()
    {
        $this->cpa = Cpa::find()->where(['name' => 'Cj.com'])->one();
        if (!$this->cpa) {
            echo "Cpa Cj.com not found";
            return;
        }
        $config = Yii::$app->params['cj.com'];

        $this->siteId = $config && isset($config['site_id']) ? $config['site_id'] : '';
        if (!$this->siteId) {
            echo "site_id in params not found";
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
        //'promotion-type' => 'Coupon',
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
                    $this->writeStore($response['links']['link']);
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
        if (count($values)>1) {
            $cashback = 'до '.$cashback;
        }
        return ['cashback' => $cashback, 'currency'=>$currency];
    }



}