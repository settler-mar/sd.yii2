<?php

namespace frontend\modules\payments\controllers;

use yii;
use frontend\modules\payments\models\Payments;
use frontend\modules\stores\models\Stores;
use frontend\modules\stores\models\CpaLink;
use frontend\components\Pagination;


/**
 * Class AccountController
 * @package frontend\modules\payments\controllers
 */
class AccountController extends \yii\web\Controller
{
    /**
     * @param yii\base\Action $action
     * @return bool
     * @throws yii\web\ForbiddenHttpException
     */
    public function beforeAction($action)
    {
        if (Yii::$app->user->isGuest) {
            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
            return false;
        }
        $this->layout = '@app/views/layouts/account.twig';
        return true;
    }

    /**
     * @return string
     * @throws yii\web\NotFoundHttpException
     */
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
            ->innerJoin(CpaLink::tableName().
                ' cwsl', 'cwp.affiliate_id = cwsl.affiliate_id AND cwp.cpa_id = cwsl.cpa_id')
            ->innerJoin(Stores::tableName(). ' cws', "cwsl.stores_id = cws.uid")
            ->where(['cwp.user_id' => \Yii::$app->user->id])
            ->orderBy('cwp.action_id DESC');

        $cacheName = 'account_payments_' . \Yii::$app->user->id . '_' . $page;
        $pagination = new Pagination($dataBase, $cacheName, ['page' => $page, 'limit' => 20, 'asArray' => true]);

        $payments = $pagination->data();
        $payStatus = \Yii::$app->params['dictionary']['pay_status'];
        foreach ($payments as $key => &$payment) {
            $payment['status_title'] = $payStatus[$payment['status']];
        }
        $data['payments'] = $payments;
        if ($pagination->pages() > 1) {
            $data["pagination"] = $pagination->getPagination('payments/account', []);
        }

        return $this->render('index', $data);
    }

}
