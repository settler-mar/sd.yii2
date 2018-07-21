<?php

namespace api\controllers;

use yii;
use yii\helpers\ArrayHelper;
use yii\filters\auth\HttpBearerAuth;
use yii\filters\auth\QueryParamAuth;
use filsh\yii2\oauth2server\filters\ErrorToExceptionFilter;
use filsh\yii2\oauth2server\filters\auth\CompositeAuth;
use yii\rest\ActiveController;
use yii\web\Controller;
use frontend\modules\stores\models\Stores;


class SiteController extends Controller
{

    protected $page;
    protected $onPage;
    /**
     * @inheritdoc
     */

    public function behaviors()
    {
        return ArrayHelper::merge(parent::behaviors(), [
            'authenticator' => [
                'class' => CompositeAuth::className(),
                'authMethods' => [
                    ['class' => HttpBearerAuth::className()],
                    ['class' => QueryParamAuth::className(), 'tokenParam' => 'access-token'],
                ]
            ],
//            'exceptionFilter' => [
//                'class' => ErrorToExceptionFilter::className()
//            ],
        ]);

    }

    public function beforeAction($action)
    {
        $this->enableCsrfValidation = false;
        \Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;

        return parent::beforeAction($action);
    }

    public function actionStores()
    {
        $this->getRequest();
        $stores = Stores::find()
            ->select([
                'name',
                'concat("https://secretdiscounter.ru/images/logos/",logo) as logo',
                'url',
                'concat("'.Yii::$app->params['go_url'].'?route=", route, "&subid='.Yii::$app->user->id.'") as click_url', //пока непонятно куда ссылка и какого вида
                'displayed_cashback as cashback',
                'description',
                'currency',
                'hold_time'
            ])
            ->where(['is_active' => 1])
            ->asArray();
        $count = $stores->count();
        $stores = $stores->limit($this->onPage)
            ->offset($this->onPage * ($this->page - 1))
            ->all();

        return ['meta' => ['page' => $this->page, 'on-page' => $this->onPage, 'count' => $count], 'stores' => $stores];
    }

    protected function getRequest()
    {
        $request = Yii::$app->request;
        $this->page = $request->get('page') && (int)$request->get('page') > 0 ? (int)$request->get('page') : 1;
        $this->onPage = $request->get('on-page') && (int)$request->get('on-page') > 0 ?
            (int)$request->get('on-page') : 100;
    }

}
