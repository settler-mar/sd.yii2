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
use JBZoo\Image\Image;

class CjController extends Controller
{


    public function actionStores()
    {
        $cj = new Cj();
        $page = 1;
        $pageCount = 1;
        $perPage = 3;
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
    }

    private function writeStore($store)
    {
        d($store);
    }

}