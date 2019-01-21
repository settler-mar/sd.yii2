<?php

namespace frontend\modules\transitions\controllers;

use yii;
use frontend\modules\transitions\models\UsersVisits;
use frontend\modules\stores\models\Stores;
use frontend\components\Pagination;
use frontend\components\AccountController as Controller;

/**
 * Class AccountController
 * @package frontend\modules\transitions\controllers
 */
class AccountController extends Controller
{
    /**
     * @param yii\base\Action $action
     * @return bool
     * @throws yii\web\ForbiddenHttpException
     */
    public function beforeAction($action)
    {
        if (Yii::$app->user->isGuest) {
            throw new \yii\web\ForbiddenHttpException(Yii::t('common', 'page_is_forbidden'));
            return false;
        }
        $this->view->layout_mode='account';
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

        $dataBase = UsersVisits::find()
            ->from(UsersVisits::tableName().' cuv')
            ->select(['cws.*', 'cuv.visit_date', 'cuv.uid', 'cuv.source'])
            ->innerJoin(Stores::tableName().
                ' cws', 'cws.uid = cuv.store_id')
            ->where(['cuv.user_id' => \Yii::$app->user->id])
            ->orderBy('cuv.visit_date DESC');

        $cacheName = 'account_transitions' . \Yii::$app->user->id . '_' . $page;
        $pagination = new Pagination($dataBase, $cacheName, ['page' => $page, 'limit' => 20, 'asArray' => true]);

        $data['visit_history'] = $pagination->data();

        if ($pagination->pages() > 1) {
            $data["pagination"] = $pagination->getPagination('account/transitions', []);
        }
        $data['date_format'] =  \Yii::t('dictionary', 'date_format_long');

        return $this->render('index', $data);
    }

}
