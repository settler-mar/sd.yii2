<?php

namespace frontend\modules\withdraw_history\controllers;

use yii;
use frontend\modules\withdraw_history\models\UsersWithdraw;
use frontend\modules\withdraw_history\models\WithdrawProcess;
use frontend\components\Pagination;

/**
 * Class AccountController
 * @package frontend\modules\withdraw_history\controllers
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

        $dataBase = UsersWithdraw::find()
            ->from(UsersWithdraw::tableName().' cwuw')
            ->select(['cwuw.*', 'cwwp.name'])
            ->innerJoin(WithdrawProcess::tableName(). ' cwwp', 'cwwp.uid = cwuw.process_id')
            ->where(['cwuw.user_id' => \Yii::$app->user->id])
            ->orderBy('cwuw.request_date DESC');

        $cacheName = 'account_withdraw_history_' . \Yii::$app->user->id . '_' . $page;
        $pagination = new Pagination($dataBase, $cacheName, ['page' => $page, 'limit' => 20, 'asArray' => true]);

        $data['withdraw'] = $pagination->data();

        if ($pagination->pages() > 1) {
            $data["pagination"] = $pagination->getPagination('withdraw-history/account', []);
        }

        return $this->render('index', $data);
    }

}
