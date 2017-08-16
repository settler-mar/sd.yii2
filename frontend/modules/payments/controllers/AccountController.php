<?php

namespace frontend\modules\payments\controllers;

use yii;
use frontend\modules\payments\models\Payments;
use frontend\modules\stores\models\Stores;
use frontend\modules\stores\models\SpaLink;
use frontend\components\Pagination;


class AccountController extends \yii\web\Controller
{
    function beforeAction($action)
    {
        if (Yii::$app->user->isGuest) {
            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
            return false;
        }
        $this->layout = '@app/views/layouts/account.twig';
        return true;
    }

    public function actionIndex()
    {
        $request = Yii::$app->request;

        $page = $request->get('page');

        $validator = new \yii\validators\NumberValidator();
        if (!empty($page) && !$validator->validate($page)) {
            throw new \yii\web\NotFoundHttpException;
        };

        $dataBase = Payments::find()
            ->from(Payments::tableName().' cwp')
            ->select(['cwp.*', 'cws.name', 'cws.route', 'cws.is_active'])
            ->innerJoin(SpaLink::tableName(). ' cwsl', 'cwp.affiliate_id = cwsl.affiliate_id AND cwp.spa_id = cwsl.spa_id')
            ->innerJoin(Stores::tableName(). ' cws', "cwsl.stores_id = cws.uid")
            ->where(['cwp.user_id' => \Yii::$app->user->id])
            ->orderBy('cwp.action_id DESC');


        $cacheName = 'account_payments_' . \Yii::$app->user->id;
        $pagination = new Pagination($dataBase, $cacheName, ['page' => $page, 'limit' => 2, 'asArray' => true]);

        $data['payments'] = $pagination->data();

        if ($pagination->pages() > 1) {
            $data["pagination"] = $pagination->getPagination($request->pathInfo, []);
        }

//
//        $notification_type = \Cwcashback\Settings::call()->getDictionary('notification_type');
//        $pay_status = \Cwcashback\Settings::call()->getDictionary('pay_status');
//        if (count($payments)) {
//            foreach ($payments as $key => &$payment) {
//                $payment['status_title'] = $pay_status[$payment['status']];
//                $payment["action_date"] = \Cwcashback\Help::formattingDate($payment["action_date"]);
//            }
//        }

        return $this->render('index', $data);
    }

}
