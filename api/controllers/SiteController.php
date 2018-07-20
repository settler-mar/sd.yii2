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


class SiteController extends Controller
{

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

        return ['foo' => 'bar'];
    }

}
