<?php

namespace api\controllers;

use yii;
use yii\helpers\ArrayHelper;
use yii\web\Controller;
use frontend\modules\stores\models\Stores;
use frontend\modules\users\models\Users;
use frontend\modules\coupons\models\Coupons;
use frontend\modules\favorites\models\UsersFavorites;
use frontend\modules\notification\models\Notifications;
use yii\web\NotFoundHttpException;



class PluginController extends Controller
{

    public function beforeAction($action)
    {
        $this->enableCsrfValidation = false;
        \Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;

        //todo убрать
//        if (!Yii::$app->user->identity) {
//            $user = Users::findOne(['uid' => 8]);
//            Yii::$app->user->login($user);
//        }

        return parent::beforeAction($action);
    }


    public function actionStore()
    {
        $cache = \Yii::$app->cache;
        $cacheName = 'stores_plugin_data_'. Yii::$app->language;

        return $cache->getOrSet($cacheName, function () {
            $fields = ['cws.uid', 'cws.url', 'cws.name', 'cws.route as store_route', 'cws.action_id', 'cws.currency',
                'cws.displayed_cashback', 'cws.logo', 'cws.conditions', 'cws.url_alternative',
                'display_on_plugin as display'];
            $stores = Stores::items([1])->andWhere(['>', 'display_on_plugin', 0])->select($fields)->all();

            $data = [
                "stores" => $stores,
            ];
            return $data;
        });
    }

    public function actionUser()
    {
        $user = Yii::$app->user->identity;
        $language = Yii::$app->language;
        if (!$user) {
            return ['language' => $language];
        }
        $cache = \Yii::$app->cache;
        $cacheName = 'user_plugin_data_'. $language.'_'.$user->uid;

        return $cache->getOrSet($cacheName, function () use ($user) {
            $favorites = UsersFavorites::userFavorites();
            $out = [
                'btn' => Yii::t('common', 'look_more'),
                'notifications'=>[],
                'user' => [
                    'balance' => $user->balance,
                    'name' => $user->name,
                    'id' => $user->uid,
                    'email' => $user->email,
                    'photo' => $user->photo,
                    'birthday' => $user->birthday,
                    'sex' => $user->sex,
                    'favorites_full' => $favorites,
                    'favorites' =>array_column($favorites, 'uid'),
                    'currency' => $user->currency,
                    'language' => $user->language
                ],
            ];
            $notifications = Notifications::find()
                ->where(['user_id' => [\Yii::$app->user->id, 0]])
                ->orderBy('added DESC')
                ->limit(20)
                ->asArray()->all();

            foreach ($notifications as &$notification) {
                $notification['currency']=$user->currency;
                    $date = strtotime($notification['added']);
                    $out['notifications'][]=[
                        'text' => Yii::$app->messageParcer->notificationText($notification),
                        'title' => Yii::$app->messageParcer->notificationTitle($notification),
                        'data' => date('d-m-Y H:i', $date),
                        'is_viewed'=>(int)$notification['is_viewed'],
                        'type_id' => (int)$notification['type_id']
                    ];
            };
            return $out;
        });
    }

    public function actionCoupon($store)
    {
        if (!$store) {
            return new NotFoundHttpException();
        }
        $storeDb = Stores::byRoute($store);
        $language = Yii::$app->language;
        $cacheName = 'coupons_plugin_data_'. $language;
        $cache = Yii::$app->cache;

        return $cache->getOrSet($cacheName, function () {
            $coupons = Coupons::forList(true)
                ->andWhere(['cws.is_active' => [1]])
                ->andWhere(['>', 'cwc.date_end', date('Y-m-d H:i:s', time())])
                ->orderBy(Coupons::$defaultSort . ' DESC')
                ->all();
            return ['coupon' => $coupons];
        });
    }

}
