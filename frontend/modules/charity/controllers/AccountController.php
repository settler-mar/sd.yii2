<?php

namespace frontend\modules\charity\controllers;

use yii;
use frontend\modules\charity\models\Charity;
use frontend\modules\funds\models\Foundations;
use frontend\components\Pagination;

/**
 * Class AccountController
 * @package frontend\modules\charity\controllers
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

        $dataBase = Charity::find()
            ->from(Charity::tableName().' cwch')
            ->select(['cwch.*', 'cwf.title'])
            ->innerJoin(Foundations::tableName(). ' cwf', 'cwch.foundation_id = cwf.uid')
            ->where(['cwch.user_id' => \Yii::$app->user->id])
            ->orderBy('cwch.added DESC');

        $cacheName = 'account_charity' . \Yii::$app->user->id . '_' . $page;
        $pagination = new Pagination($dataBase, $cacheName, ['page' => $page, 'limit' => 20, 'asArray' => true]);

        $data['charity'] = $pagination->data();

        if ($pagination->pages() > 1) {
            $data["pagination"] = $pagination->getPagination('charity/account', []);
        }

        return $this->render('index', $data);
    }

}
