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

}
