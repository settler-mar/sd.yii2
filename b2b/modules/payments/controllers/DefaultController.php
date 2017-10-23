<?php

namespace b2b\modules\payments\controllers;

use Yii;
use frontend\modules\payments\models\Payments;
use b2b\modules\payments\models\PaymentsSearch;
use frontend\modules\stores\models\Stores;
use frontend\modules\stores\models\CpaLink;
use b2b\modules\stores_points\models\B2bStoresPoints;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;
use common\components\Help;
use yii\filters\AccessControl;
use yii\validators\NumberValidator;
use yii\validators\EachValidator;
use yii\validators\RequiredValidator;
use yii\validators\StringValidator;

/**
 * DefaultController implements the CRUD actions for Payments model.
 */
class DefaultController extends Controller
{
    public function behaviors()
    {
        return [
            'verbs' => [
                'class' => VerbFilter::className(),
                'actions' => [
                    'status' => ['post'],
                    'update' => ['post'],
                ],
            ],
            'access' => [
                'class' => AccessControl::className(),
                'rules' => [
                    [
                        'actions' => ['index', 'status', 'update'],
                        'allow' => true,
                        'roles' => ['@'],
                    ],
                ],
            ],
        ];
    }

    /**
     * Lists all Payments models.
     * @return mixed
     */
    public function actionIndex()
    {
        $searchModel = new PaymentsSearch();
        $dataProvider = $searchModel->search(Yii::$app->request->queryParams);


        $search_range = Yii::$app->request->get('date');
        if (empty($search_range) || strpos($search_range, '-') === false) {
            $search_range = date('01-01-Y') . ' - ' . date('d-m-Y');
        }

        list($start_date, $end_date) = explode(' - ', $search_range);
        $storesPoints = B2bStoresPoints::find()
          ->select(['sp.id as point_id', 'sp.country', 'sp.city', 'sp.address',
            'sp.name as point_name', 'cws.uid as store_id', 'cws.name as store_name'])
          ->from(B2bStoresPoints::tableName(). ' sp')
          ->innerJoin(Stores::tableName().' cws', 'sp.store_id = cws.uid')
          ->orderBy(['cws.name' => 'DESC', 'sp.name' => 'DESC'])
          ->asArray()
          ->all();

        $stores = [];


        foreach ($storesPoints as $point) {
            $stores[$point['store_id']]['name'] = $point['store_name'];
            $stores[$point['store_id']]['points'][] = $point;
        }
        $tableData = [
            'store_name' => function ($model) {
                return $model->store->name;
            },
            'store_point_name' => function ($model) {
              if(!$model->store_point_id)return '';
              return $model->storesPoint->name;
            },
            'click_date' => function ($model) {
                return date('d.m.Y H:i', strtotime($model->click_date));
            },
            'closing_date' => function ($model) {
                return date('d.m.Y', strtotime($model->closing_date));
            },
            'user' => function ($model) {
                return 'SD-' . str_pad($model->user_id, 8, '0', STR_PAD_LEFT);
            },
            'status' => function ($model) {
                return Yii::$app->help->colorStatus($model->status);
            },
            'update_button' => function ($model) {
                if (in_array($model->status, [0])) {
                    return '<a href="#" data-id="' . $model->uid . '" data-cashback="'. $model->cashback .'" title="Изменить сумму" class="change-order-price"><i class="fa fa-pencil"></i></a>';
                } else {
                    return '';
                }
            },
            'checkbox_options'=> function ($model) {
                if ($model->status != 0) {
                    return ['disabled' => '1', 'class' => 'hidden'];
                } else {
                    return [];
                }
            },
            'date_alarm' => function ($model) {
                return [
                    'class' => (strtotime('+5 days') > strtotime($model->closing_date) && $model->status == 0) ?
                      'date_alarm': '',
                ];
            },

        ];
        //статистика по выборке
        $queryAll = clone $dataProvider->query;
        $queryAll->select(['sum(cashback) as cashback', 'sum(order_price * kurs) as order_price']);
        $resultAllCount = $queryAll->count();
        $resultAll = $queryAll->one();

        $querySuccess = clone $queryAll;
        $querySuccess->andWhere(['status'=> 2]);
        $resultSuccessCount = $querySuccess->count();
        $resultSuccess = $querySuccess->one();

        $queryWaiting = clone $queryAll;
        $queryWaiting->andWhere(['status'=> 0]);
        $resultWaitingCount = $queryWaiting->count();
        $resultWaiting = $queryWaiting->one();

        $queryRevoke = clone $queryAll;
        $queryRevoke->andWhere(['status'=> 1]);
        $resultRevokeCount = $queryRevoke->count();
        $resultRevoke = $queryRevoke->one();


        return $this->render('index.twig', [
            'searchModel' => $searchModel,
            'dataProvider' => $dataProvider,
            'data_ranger' => Help::DateRangePicker($start_date . ' - ' . $end_date, 'date', []),
            'click_data_range'=>Help::DateRangePicker($searchModel, 'click_data_range', ['hideInput'=>false]),
            'end_data_range'=>Help::DateRangePicker($searchModel, 'end_data_range', ['hideInput'=>false]),
            'stores' => $stores,
            'table_data' => $tableData,
            'storeId' => Yii::$app->request->get('storeId'),
            'store_point' => Yii::$app->request->get('store_point'),
            'result_waiting' => ['count'=>$resultWaitingCount,'summs'=>$resultWaiting],
            'result_success' => ['count' => $resultSuccessCount, 'summs'=> $resultSuccess],
            'result_all' => ['count' => $resultAllCount, 'summs'=> $resultAll],
            'result_revoke' => ['count' => $resultRevokeCount, 'summs'=> $resultRevoke],
        ]);
    }


    /**
     * @return mixed
     * @throws NotFoundHttpException
     */
    public function actionStatus()
    {
        $request = Yii::$app->request;
        if (!$request->isAjax) {
            throw new NotFoundHttpException();
        }
        $status = $request->post('status');
        $ids = $request->post('id');
        $validator = new NumberValidator();
        $validatorEach = new EachValidator(['rule' => ['integer']]);
        $validatorRequired = new RequiredValidator();
        if (!$validatorRequired->validate([$ids, $status])
            || !$validator->validate($status)
            || !$validatorEach->validate($ids)
        ) {
            return json_encode(['error'=>true]);
        }
        //перед изменением, проверка, что платежи из магазинов юсера, и статус 0
        $payments = Payments::find()
            ->select(['cwp.uid'])
            ->from(Payments::tableName()  . ' cwp')
            ->joinWith(['store'])
            ->innerJoin('b2b_users_cpa b2buc', 'cw_cpa_link.id = b2buc.cpa_link_id')
            ->where([
                'b2buc.user_id' => Yii::$app->user->identity->id,
                'cwp.status' => 0,
                'cwp.uid' => $ids,
            ])->column();
        Payments::updateAll(['status' => $status], ['uid' => $payments]);
        return json_encode(['error' => false]);
    }




    /**
     * Updates an existing Payments model.
     * @param integer $id
     * @return mixed
     */
    public function actionUpdate()
    {
        if (!Yii::$app->request->isAjax) {
            throw new NotFoundHttpException();
        }
        $request = Yii::$app->request;
        $cashback = $request->post('cashback');
        $id = intval($request->post('id'));
        $adminComment = $request->post('admin-comment');
        $validator = new NumberValidator();
        $validatorRequired = new RequiredValidator();
        $validatorString = new StringValidator(['min' => 5, 'max' => 256]);
        if (!$validatorRequired->validate([$id, $cashback, $adminComment])
          || !$validator->validate($id)
          || !$validator->validate($cashback)
          || !$validatorString->validate($adminComment)
        ) {
            return json_encode(['error'=>true, 'message' => 'Неправильные данные', 'post' => $request->post()]);
        }

        $payment = Payments::find()
          ->from(Payments::tableName()  . ' cwp')
          ->joinWith(['store'])
          ->innerJoin('b2b_users_cpa b2buc', 'cw_cpa_link.id = b2buc.cpa_link_id')
          ->where([
            'b2buc.user_id' => Yii::$app->user->identity->id,
            'cwp.status' => 0,
            'cwp.uid' => $id,
          ])->one();

        if ($payment) {
            $cashback = round($cashback, 2);
            $payment->cashback = $cashback;
            $payment->admin_comment = $adminComment;
            $payment->save();
            return json_encode(['error'=>false, 'cashback' => $cashback]);
        } else {
            return json_encode(['error'=>true, 'message' => 'Платёж не найден']);
        }
    }

}
