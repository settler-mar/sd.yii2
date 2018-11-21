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
          'revoke' => ['post'],
        ],
      ],
      'access' => [
        'class' => AccessControl::className(),
        'rules' => [
          [
            'actions' => ['index', 'status', 'update', 'revoke'],
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
    $user_id = Yii::$app->user->id;

    $storesPoints = B2bStoresPoints::find()
      ->select(['sp.id as point_id', 'sp.country', 'sp.city', 'sp.address',
        'sp.name as point_name', 'cws.uid as store_id', 'cws.name as store_name','cws.currency as currency'])
      ->from(B2bStoresPoints::tableName() . ' sp')
      ->innerJoin(Stores::tableName() . ' cws', 'sp.store_id = cws.uid')
      ->innerJoin('cw_cpa_link', 'cws.active_cpa = cw_cpa_link.id')
      ->innerJoin('b2b_users_cpa b2buc', 'cw_cpa_link.id = b2buc.cpa_link_id')
      ->where([
        'b2buc.user_id' => $user_id
      ])
      ->orderBy(['cws.name' => 'DESC', 'sp.name' => 'DESC'])
      ->asArray()
      ->all();

    $stores = [];
    $store_ids = [];
    $resultCur=[];
    foreach ($storesPoints as $point) {
      $stores[$point['store_id']]['name'] = $point['store_name'];
      $stores[$point['store_id']]['points'][] = $point;
      if(!in_array($point['store_id'],$store_ids)){
        $store_ids[]=$point['store_id'];
      }
      if(!in_array($point['currency'],$resultCur)){
        $resultCur[]=$point['currency'];
      }
    }
    $resultCur = count($resultCur) == 1 ? $resultCur[0] : false;
    //d($resultCur);
    //ddd($stores);

    $params=Yii::$app->request->queryParams;
    $params['users_shops']=$store_ids;

    $searchModel = new PaymentsSearch();
    $dataProvider = $searchModel->search($params);

    $search_range = Yii::$app->request->get('date');
    if (empty($search_range) || strpos($search_range, '-') === false) {
      $search_range = date('01-01-Y') . ' - ' . date('d-m-Y');
    }
    list($start_date, $end_date) = explode(' - ', $search_range);

    $tableData = [
      'store_name' => function ($model) {
        return $model->store->name;
      },
      'store_point_name' => function ($model) {
        if (!$model->store_point_id) return '';
        return $model->storesPointText;
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
      'update_buttons' => function ($model) {
        if (in_array($model->status, [0])) {
          return '<a href="#" data-id="' . $model->uid . '" data-orderprice="' . $model->order_price . '" title="Изменить сумму" class="change-order-price"><i class="fa fa-pencil"></i></a>' .
          '<a href="#" data-id="' . $model->uid . '" title="Отменить платёж" class="revert-order"><i class="fa fa-trash"></i></a>';
        } else {
          return '';
        }
      },
      'checkbox_options' => function ($model) {
        if ($model->status != 0) {
          return ['disabled' => '1', 'class' => 'hidden'];
        } else {
          return [];
        }
      },
      'date_alarm' => function ($model) {
        return [
          'class' => (strtotime('+5 days') > strtotime($model->closing_date) && $model->status == 0) ?
            'date_alarm' : '',
        ];
      },
      'order_price_options' => function ($model) {
        return [
          'class' => 'td-order-price'
        ];
      },
      'order_price_value' => function ($model) {
        return $model->order_price . ' ' . $model->storeCur;
      },
      'reward_value' => function ($model) {
        return round($model->reward / $model->kurs, 2, PHP_ROUND_HALF_DOWN) . ' ' . $model->storeCur;
      },
      'cashback_value' => function ($model) {
        return round($model->cashback / $model->kurs, 2, PHP_ROUND_HALF_DOWN). ' ' . $model->storeCur;
      },

    ];
    //статистика по выборке
    $queryAll = clone $dataProvider->query;
    $queryTest = clone $dataProvider->query;
    $queryTest->select([
        'cw_stores.currency',
        'sum(cashback/kurs) as cashback_store',
        'sum(reward/kurs) as reward_store',
        'sum(order_price) as order_price_store',
        'sum(kurs_rub * cashback/kurs) as cashback_rub',
        'sum(kurs_rub * reward/kurs) as reward_rub',
        'sum(kurs_rub * order_price) as order_price_rub',
    ])->groupBy(['cw_stores.currency'])->asArray();
    //$resultTest = $queryTest->all();
    //ddd($resultTest);
    $queryAll->select([
      //'sum(cashback) as cashback',
      'sum(cashback/kurs) as cashback_local',
      //'sum(reward) as reward',
      'sum(reward/kurs) as reward_local',
      //'sum(order_price * kurs) as order_price',
      'sum(order_price) as order_price_local',
    ]);
    $resultAllCount = $queryAll->count();
    $resultAll = $queryAll->one();

    $querySuccess = clone $queryAll;
    $querySuccess->andWhere(['status' => 2]);
    $resultSuccessCount = $querySuccess->count();
    $resultSuccess = $querySuccess->one();

    $queryWaiting = clone $queryAll;
    $queryWaiting->andWhere(['status' => 0]);
    $resultWaitingCount = $queryWaiting->count();
    $resultWaiting = $queryWaiting->one();

    $queryRevoke = clone $queryAll;
    $queryRevoke->andWhere(['status' => 1]);
    $resultRevokeCount = $queryRevoke->count();
    $resultRevoke = $queryRevoke->one();

    //валюта платежей, если только одного вида
    /*$resultCur = $queryCur
      //->select('cw_stores.currency')
      //->with('store')
      ->asArray()
      ->all();

    ddd($resultCur);
    $resultCur = array_unique(array_column($resultCur, 'currency'));
    $resultCur = count($resultCur) == 1 ? $resultCur[0] : false;
    //ddd($resultCur);*/


    return $this->render('index.twig', [
      'searchModel' => $searchModel,
      'dataProvider' => $dataProvider,
      'data_ranger' => Help::DateRangePicker($start_date . ' - ' . $end_date, 'date', []),
      'click_data_range' => Help::DateRangePicker($searchModel, 'click_data_range', ['hideInput' => false]),
      'end_data_range' => Help::DateRangePicker($searchModel, 'end_data_range', ['hideInput' => false]),
      'stores' => $stores,
      'table_data' => $tableData,
      'storeId' => Yii::$app->request->get('storeId'),
      'store_point' => Yii::$app->request->get('store_point'),
      'result_waiting' => ['count' => $resultWaitingCount, 'summs' => $resultWaiting],
      'result_success' => ['count' => $resultSuccessCount, 'summs' => $resultSuccess],
      'result_all' => ['count' => $resultAllCount, 'summs' => $resultAll],
      'result_revoke' => ['count' => $resultRevokeCount, 'summs' => $resultRevoke],
      'currency' => $resultCur,
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
      return json_encode(['error' => true]);
    }
    if ($this->update($ids, ['status' => $status])) {
      return json_encode(['error' => false]);
    } else {
      return json_encode(['error' => true, 'message' => 'Платёж не найден']);
    }
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
    $orderPrice = $request->post('order_price');
    $id = intval($request->post('id'));
    $adminComment = $request->post('admin-comment');
    $validator = new NumberValidator();
    $validatorRequired = new RequiredValidator();
    $validatorString = new StringValidator(['min' => 5, 'max' => 256]);
    if (!$validatorRequired->validate([$id, $orderPrice, $adminComment])
      || !$validator->validate($id)
      || !$validator->validate($orderPrice)
      || !$validatorString->validate($adminComment)
    ) {
      return json_encode(['error' => true, 'message' => 'Неправильные данные', 'post' => $request->post()]);
    }

    $recalc = Payments::recalcCashback($id, $orderPrice);

    if ($recalc && $this->update($id, [
        'order_price' => $recalc['order_price'],
        'admin_comment' => $adminComment,
        'reward' => $recalc['reward'],
        'cashback' => $recalc['cashback'],
      ])
    ) {
      return json_encode(['error' => false, 'recalc' => $recalc]);
    } else {
      return json_encode(['error' => true, 'message' => 'Платёж не найден']);
    }
  }

  public function actionRevoke()
  {
    $request = Yii::$app->request;
    if (!$request->isAjax) {
      throw new NotFoundHttpException();
    }
    $ids = $request->post('ids');
    $adminComment = $request->post('admin-comment');
    $validator = new NumberValidator();
    $validatorRequired = new RequiredValidator();
    $validatorString = new StringValidator(['min' => 5, 'max' => 256]);
    if (!$validatorRequired->validate([$ids, $adminComment])
      || !$validator->validate($ids)
      || !$validatorString->validate($adminComment)
    ) {
      return json_encode(['error' => true, 'message' => 'Неправильные данные']);
    }
    if ($this->update($ids, ['status' => 1, 'admin_comment' => $adminComment])) {
      return json_encode(['error' => false]);
    } else {
      return json_encode(['error' => true, 'message' => 'Платёж не найден']);
    }
  }

  /**
   * @param $id
   * @param $data
   * @return array|bool
   */
  private function update($id, $data)
  {
    $payments = Payments::find()
      ->select(['cwp.uid'])
      ->from(Payments::tableName() . ' cwp')
      ->joinWith(['store'])
      ->innerJoin('b2b_users_cpa b2buc', 'cw_cpa_link.id = b2buc.cpa_link_id')
      ->where([
        'b2buc.user_id' => Yii::$app->user->identity->id,
        'cwp.status' => 0,
        'cwp.uid' => $id,
      ])->column();
    if ($payments) {
      Payments::updateAll($data, ['uid' => $payments]);
      return $payments;
    } else {
      return false;
    }
  }


}
