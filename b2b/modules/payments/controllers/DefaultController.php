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
use b2b\modules\users\models\B2bUsers;

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
        $dataRanger = Help::DateRangePicker(
          $start_date . ' - ' . $end_date,
          'date', [
          'pluginEvents' => [
            "apply.daterangepicker" => "function(ev, picker) {
            picker.element.closest('form').submit();
          }",
          ]
        ]);
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
                return $model->store->name . ' (' . $model->store->uid . ')';
            },
            'store_point_name' => function ($model) {
                return $model->storesPoint->name . ' (' . $model->storesPoint->id . ')';
            }

        ];
        return $this->render('index.twig', [
            'searchModel' => $searchModel,
            'dataProvider' => $dataProvider,
            'data_ranger' => $dataRanger,
            'stores' => $stores,
            'table_data' => $tableData,
            'storeId' => Yii::$app->request->get('storeId'),
            'store_point' => Yii::$app->request->get('store_point'),
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
    protected function findModel($id)
    {
        if (($model = Payments::findOne($id)) !== null) {
            return $model;
        } else {
            throw new NotFoundHttpException('The requested page does not exist.');
        }
    }
}
