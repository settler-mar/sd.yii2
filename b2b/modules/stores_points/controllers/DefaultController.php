<?php

namespace b2b\modules\stores_points\controllers;

use Yii;
use yii\validators\NumberValidator;
use b2b\modules\stores_points\models\B2bStoresPoints;
use b2b\modules\stores_points\models\B2bStoresPointsSearch;
use frontend\modules\stores\models\CpaLink;
use frontend\modules\stores\models\Stores;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;
use yii\filters\AccessControl;

/**
 * DefaultController implements the CRUD actions for B2bStoresPoints model.
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
                        'allow' => true,
                        'roles' => ['@'],
                    ],
                ],
            ],
        ];
    }

    /**
     * Lists all B2bStoresPoints models.
     * @return mixed
     */
//    public function actionIndex()
//    {
//        $searchModel = new B2bStoresPointsSearch();
//        $dataProvider = $searchModel->search(Yii::$app->request->queryParams);
//
//        return $this->render('index.twig', [
//            'searchModel' => $searchModel,
//            'dataProvider' => $dataProvider,
//        ]);
//    }

    /**
     * Displays a single B2bStoresPoints model.
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
     * Creates a new B2bStoresPoints model.
     * If creation is successful, the browser will be redirected to the 'view' page.
     * @return mixed
     */
    public function actionCreate($route)
    {
        $model = new B2bStoresPoints();

        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            return $this->redirect(['/home']);
        } else {
            $store = Stores::byRoute($route);
            $model->store_id = $store->uid;
            $model->route = $store->route;
            return $this->render('create.twig', [
                'model' => $model,
            ]);
        }
    }

    /**
     * Updates an existing B2bStoresPoints model.
     * If update is successful, the browser will be redirected to the 'view' page.
     * @param integer $id
     * @return mixed
     */
    public function actionUpdate($id)
    {
        $model = $this->findModel($id);

        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            return $this->redirect(['/home']);
        } else {
            $store = Stores::findOne($model->store_id);
            $model->route = $store->route;
            $model->work_time_details = json_decode($model->work_time_json, true);
            return $this->render('update.twig', [
                'model' => $model,
            ]);
        }
    }

    /**
     * Deletes an existing B2bStoresPoints model.
     * If deletion is successful, the browser will be redirected to the 'index' page.
     * @param integer $id
     * @return mixed
     */
    public function actionDelete()
    {
        $id=Yii::$app->request->post('id');
        $validator = new NumberValidator();
        if (!$validator->validate($id)) {
            Yii::$app->session->addFlash('err', 'Ошибка');
            $this->redirect(['/home']);
        }
        $model = $this->findModel($id);
        //проверка, что точка продаж для магазина юсера
        $cpa = CpaLink::find()
          ->from(CpaLink::tableName() . ' cwcl')
          ->innerJoin('b2b_users_cpa b2buc', 'b2buc.cpa_link_id = cwcl.id')
          ->innerJoin(Stores::tableName(). ' cws', 'cws.uid = cwcl.stores_id')
          ->where([
            'cws.uid' => $model->store_id,
            'b2buc.user_id'=> Yii::$app->user->identity->id,
          ])->count();
        if ($cpa != 1) {
            Yii::$app->session->addFlash('err', 'Ошибка');
            $this->redirect(['/home']);
        }
        $model->delete();
        Yii::$app->session->addFlash('info', 'Точка продаж удалена');
        return $this->redirect(['/home']);
    }

    /**
     * Finds the B2bStoresPoints model based on its primary key value.
     * If the model is not found, a 404 HTTP exception will be thrown.
     * @param integer $id
     * @return B2bStoresPoints the loaded model
     * @throws NotFoundHttpException if the model cannot be found
     */
    protected function findModel($id)
    {
        if (($model = B2bStoresPoints::findOne($id)) !== null) {
            return $model;
        } else {
            throw new NotFoundHttpException('The requested page does not exist.');
        }
    }
}
