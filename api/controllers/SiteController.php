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
use frontend\modules\stores\models\CpaLink;
use frontend\modules\payments\models\Payments;


class SiteController extends Controller
{

    protected $page;
    protected $onPage;
    protected $dateFrom;

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

    public function actionIndex()
    {
        return 1;
    }


    public function actionStores()
    {
        $this->getRequest();
        $stores = Stores::find()
            ->select([
                'name',
                'concat("https://secretdiscounter.ru/images/logos/",logo) as logo',
                'url',
                'concat("'.Yii::$app->params['go_url'].'/go/", route, "/'.Yii::$app->user->id.'") as click_url', //пока непонятно куда ссылка и какого вида
                'concat("'.Yii::$app->params['go_url'].'/store/", route, "/'.Yii::$app->user->id.'") as click_url_addblock', //пока непонятно куда ссылка и какого вида
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

    public function actionPayments()
    {
        $this->getRequest();
        $payments = Payments::find()
            ->from(Payments::tableName() . ' cwp')
            ->select([
                'cwcl.stores_id as store_id',
                'cwp.action_id as action_id',
                'order_id',
                'click_date',
                'action_date',
                'status_updated',
                'closing_date',
                'order_price',
                'cws.currency as store_currency',
                'reward',
                'cashback',
                'concat("' . Yii::$app->user->identity->currency . '") as user_currency',
                'kurs',
                'user_id',
                'sub_id',
                'IF(status=2,"Confirmed",IF(status=1,"Canceled","Waiting")) as status',
            ])
            ->leftJoin(CpaLink::tableName() .' cwcl', 'cwp.cpa_id = cwcl.cpa_id and cwp.affiliate_id = cwcl.affiliate_id')
            ->innerJoin(Stores::tableName() . ' cws', 'cws.uid = cwcl.stores_id')
            ->where(['user_id'=> Yii::$app->user->id])
            ->asArray();
        if ($this->dateFrom) {
            $payments->andWhere(['>=', 'click_date', $this->dateFrom]);
        }
        $count = $payments->count();
        $payments = $payments->limit($this->onPage)
            ->offset($this->onPage * ($this->page - 1))
            ->all();
        return [
            'meta' => ['page' => $this->page, 'on-page' => $this->onPage, 'count' => $count, 'date-from'=>$this->dateFrom],
            'payments' => $payments
        ];
    }

    protected function getRequest()
    {
        $request = Yii::$app->request;
        $this->page = $request->get('page') && (int)$request->get('page') > 0 ? (int)$request->get('page') : 1;
        $this->onPage = $request->get('on-page') && (int)$request->get('on-page') > 0 ?
            (int)$request->get('on-page') : 100;
        $this->dateFrom = $request->get('date-from') && $request->get('date-from') != '' ?
            date('Y-m-d H:i:s', strtotime($request->get('date-from'))) : false;
    }

}
