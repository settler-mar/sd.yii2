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
                    'delete' => ['post'],
                ],
            ],
            'access' => [
                'class' => AccessControl::className(),
                'rules' => [
                    [
                        'actions' => ['index'],
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
        $dataRanger = Help::DateRangePicker($start_date . ' - ' . $end_date, 'date', []);
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
            'action_date' => function ($model) {
                return date('d.m.Y H:i', strtotime($model->action_date));
            },
            'email' => function ($model) {
                return $model->user ? $model->user->email : '';
            },
            'status' => function ($model) {
                return Yii::$app->help->colorStatus($model->status);
            },
        ];
        //статистика по выборке
        $query1 = clone $dataProvider->query;
        $query1->select(['sum(cashback) as cashback']);
        $query2 = clone $query1;
        $query1->andWhere(['status'=> 0]);
        $query2->andWhere(['status'=> 2]);
        $resultWaitingCount = $query1->count();
        $resultSuccessCount = $query2->count();
        $resultWaiting = $query1->one();
        $resultSuccess = $query2->one();

        return $this->render('index.twig', [
            'searchModel' => $searchModel,
            'dataProvider' => $dataProvider,
            'data_ranger' => $dataRanger,
            'stores' => $stores,
            'table_data' => $tableData,
            'storeId' => Yii::$app->request->get('storeId'),
            'store_point' => Yii::$app->request->get('store_point'),
            'result_waiting' => ['count'=>$resultWaitingCount,'cashback'=>$resultWaiting->cashback],
            'result_success' => ['count' => $resultSuccessCount, 'cashback'=> $resultSuccess->cashback],
        ]);
    }

    /**
     * Displays a single Payments model.
     * @param integer $id
     * @return mixed
     */
//    public function actionView($id)
//    {
//        return $this->render('view.twig', [
//            'model' => $this->findModel($id),
//        ]);
//    }

    /**
     * Creates a new Payments model.
     * If creation is successful, the browser will be redirected to the 'view' page.
     * @return mixed
     */
//    public function actionCreate()
//    {
//        $model = new Payments();
//
//        if ($model->load(Yii::$app->request->post()) && $model->save()) {
//            return $this->redirect(['view', 'id' => $model->uid]);
//        } else {
//            return $this->render('create.twig', [
//                'model' => $model,
//            ]);
//        }
//    }

    /**
     * Updates an existing Payments model.
     * If update is successful, the browser will be redirected to the 'view' page.
     * @param integer $id
     * @return mixed
     */
//    public function actionUpdate($id)
//    {
//        $model = $this->findModel($id);
//
//        if ($model->load(Yii::$app->request->post()) && $model->save()) {
//            return $this->redirect(['view', 'id' => $model->uid]);
//        } else {
//            return $this->render('update.twig', [
//                'model' => $model,
//            ]);
//        }
//    }

    /**
     * Deletes an existing Payments model.
     * If deletion is successful, the browser will be redirected to the 'index' page.
     * @param integer $id
     * @return mixed
     */
//    public function actionDelete($id)
//    {
//        $this->findModel($id)->delete();
//
//        return $this->redirect(['index']);
//    }

    /**
     * Finds the Payments model based on its primary key value.
     * If the model is not found, a 404 HTTP exception will be thrown.
     * @param integer $id
     * @return Payments the loaded model
     * @throws NotFoundHttpException if the model cannot be found
     */
//    protected function findModel($id)
//    {
//        if (($model = Payments::findOne($id)) !== null) {
//            return $model;
//        } else {
//            throw new NotFoundHttpException('The requested page does not exist.');
//        }
//    }
}
