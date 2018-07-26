<?php

namespace app\modules\cpa\controllers;

use yii\web\Controller;
use yii;
use frontend\modules\stores\models\Stores;
use frontend\modules\stores\models\CpaLink;
use frontend\modules\stores\models\Cpa;
use frontend\modules\payments\models\Payments;
use frontend\modules\users\models\Users;



class DefaultController extends Controller
{

    public function actionPlayeurolotto()
    {
        $request = Yii::$app->request;
        $config = isset(Yii::$app->params['outstand_cpa']['playeurolotto']) ?
            Yii::$app->params['outstand_cpa']['playeurolotto'] : false;

        if (!$config || !isset($config['ip']) || $config['ip'] != $request->userIP) {
            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
            return false;
        }

        $store = isset($config['route']) ? Stores::find()->where(['route' => $config['route']])->one() : false;
        $cpa = Cpa::findOne(['name'=>'Внешние подключения']);
        //найти спа-линк даже если активе спа поменялся
        $cpaLink = $store && $cpa ? CpaLink::findOne(['stores_id' => $store->uid, 'cpa_id' => $cpa->id]) : false;

        if (!$cpaLink) {
            throw new \yii\web\NotFoundHttpException();
            return false;
        }

        //запрос 'type={TYPE}&paymentid={EVENTID}&commision={COMMISION}&subid={TAG1}'


        $get = $request->get();
        $user = isset($get['subid']) ? Users::findOne($get['subid']) : false;
        $type = isset($get['type']) ? $get['type'] : false;
        $paymentId = isset($get['paymentid']) ? $get['paymentid'] : false;
        $comission = isset($get['commision']) ? $get['commision'] : false;

        // c этим непонятно пока нужно ли, и правильно ли слово
//        if ($type != 'продажа') {
//            throw new \yii\web\NotFoundHttpException();
//            return false;
//        }
        if (!$user && !$paymentId) {
            throw new \yii\web\NotFoundHttpException();
            return false;
        }

        $payment = Payments::findOne(['action_id'=> $paymentId, 'affiliate_id' => $cpaLink->affiliate_id]);
        if ($payment) {
            Yii::$app->response->statusCode = 200;
            return json_encode(['status' => 'ok']);
        } else {
            $date = date('Y-m-d H:i:s');

            $payment = [
                'status' => 2,
                'subid' => $user->uid,
                'positions' => false,
                'action_id' => $paymentId,
                'cart' => 0,
                'payment' => $comission ? $comission / 100 : 0,
                'click_date' =>  $date,
                'action_date' =>  $date,
                'status_updated' =>  $date,
                'closing_date' =>  $date,
                'product_country_code' => null,
                'order_id' => $paymentId,
                'tariff_id' => null,
                'currency' => 'EUR',
                'affiliate_id' => $cpaLink->affiliate_id,
                'cpa_id' => $cpa->id
            ];
            $paymentStatus = Payments::makeOrUpdate(
                $payment,
                $store,
                $user,
                null,
                ['notify' => true, 'email' => true]
            );
            if ($paymentStatus['save_status']) {
                Yii::$app->response->statusCode = 200;
                return json_encode(['status' => 'ok']);
            } else {
                Yii::$app->response->statusCode = 500;
                return json_encode(['status' => 'error']);
            }
        }
    }

    /**
     * collback с Awin
     */
    public function actionAwin()
    {
        /*
         array(17) {
  ["transactionId"]=>
  string(9) "105956531"
  ["transactionDate"]=>
  string(19) "2013-06-13 12:05:00"
  ["transactionCurrency"]=>
  string(3) "GBP"
  ["transactionAmount"]=>
  string(5) "26.09"
  ["trackedCurrency"]=>
  string(3) "EUR"
  ["trackedAmount"]=>
  string(5) "34.04"
  ["affiliateId"]=>
  string(6) "45628"
  ["merchantId"]=>
  string(4) "3661"
  ["groupId"]=>
  string(1) "0"
  ["bannerId"]=>
  string(1) "0"
  ["clickRef"]=>
  string(14) "LINKCMP2013-06"
  ["clickRef4"]=>
  string(12) "User82828211"
  ["clickThroughTime"]=>
  string(19) "2013-06-13 12:00:00"
  ["commission"]=>
  string(4) "1.64"
  ["clickTime"]=>
  string(19) "2013-06-13 12:00:00"
  ["url"]=>
  string(55) "http://www.publisher-domain.com/advertiser/product/"
  ["phrase"]=>
  string(16) "Electronic music"
  ["searchEngine"]=>
  string(15) "MSN Live Search"
  ["commissionGroups"]=>
  array(2) {
    [0]=>
    array(4) {
      ["id"]=>
      string(5) "47963"
      ["name"]=>
      string(2) "CD"
      ["code"]=>
      string(2) "CD"
      ["description"]=>
      string(2) "CD"
    }
    [1]=>
    array(4) {
      ["id"]=>
      string(5) "47965"
      ["name"]=>
      string(3) "DVD"
      ["code"]=>
      string(3) "DVD"
      ["description"]=>
      string(3) "DVD"
    }
  }
  ["products"]=>
  array(2) {
    [0]=>
    array(7) {
      ["productName"]=>
      string(26) "The Knife – Silent Shout"
      ["unitPrice"]=>
      string(4) "5.55"
      ["skuType"]=>
      string(0) ""
      ["skuCode"]=>
      string(10) "B000EMSUQA"
      ["quantity"]=>
      string(1) "2"
      ["category"]=>
      string(16) "Electronic Music"
      ["cgId"]=>
      string(5) "47963"
    }
    [1]=>
    array(7) {
      ["productName"]=>
      string(17) "Sigur Ros - Heima"
      ["unitPrice"]=>
      string(5) "14.99"
      ["skuType"]=>
      string(0) ""
      ["skuCode"]=>
      string(10) "B000EMSUQA"
      ["quantity"]=>
      string(1) "1"
      ["category"]=>
      string(9) "Music DVD"
      ["cgId"]=>
      string(5) "47965"
    }
  }*/
        $cpa = Cpa::find()->where(['name' => 'Awin'])->one();
        if (!$cpa) {
            throw new \yii\web\NotFoundHttpException();
            return false;
        }

        $request = Yii::$app->request;
        $data = json_decode($request->post('AwinTransactionPush'), true);
        if (!$data) {
            throw new \yii\web\NotFoundHttpException();
            return false;
        }

        $cpaLink = CpaLink::findOne(['cpa_id' => $cpa->id, 'affiliate_id' => $data['merchantId']]);//или affiliateId - пока непонятно
        if (!$cpaLink) {
            throw new \yii\web\NotFoundHttpException();
            return false;
        }

        //$payment = Payments::findOne(['action_id'=> $data['transactionId'], 'affiliate_id' => $cpaLink->affiliate_id]);
//        if ($payment) {
//            Yii::$app->response->statusCode = 200;
//            return json_encode(['status' => 'ok']);
//        } else {
        $date = date('Y-m-d H:i:s');

        $payment = [
//            'status' => 2,
//            'subid' => $user->uid,
//            'positions' => false,
//            'action_id' => $data['transactionId'],
//            'cart' => 0,
//            'payment' => $comission ? $comission / 100 : 0,
//            'click_date' =>  $date,
//            'action_date' =>  $date,
//            'status_updated' =>  $date,
//            'closing_date' =>  $date,
//            'product_country_code' => null,
//            'order_id' => $paymentId,
//            'tariff_id' => null,
//            'currency' => 'EUR',
//            'affiliate_id' => $cpaLink->affiliate_id,
//            'cpa_id' => $cpa->id
        ];
        $paymentStatus = Payments::makeOrUpdate(
            $payment,
            $cpaLink->store,
            $user,
            null,
            ['notify' => true, 'email' => true]
        );
        if ($paymentStatus['save_status']) {
            Yii::$app->response->statusCode = 200;
            return json_encode(['status' => 'ok']);
        } else {
            Yii::$app->response->statusCode = 500;
            return json_encode(['status' => 'error']);
        }
        //}


    }
}
