<?php

namespace b2b\modules\stores_points\controllers;

use Yii;
use b2b\modules\stores_points\models\B2bStoresPoints;
use b2b\modules\stores_points\models\B2bStoresPointsSearch;
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
    public function actionIndex()
    {
        $searchModel = new B2bStoresPointsSearch();
        $dataProvider = $searchModel->search(Yii::$app->request->queryParams);

        return $this->render('index.twig', [
            'searchModel' => $searchModel,
            'dataProvider' => $dataProvider,
        ]);
    }

    /**
     * Displays a single B2bStoresPoints model.
     * @param integer $id
     * @return mixed
     */
    public function actionView($id)
    {
        return $this->render('view.twig', [
            'model' => $this->findModel($id),
        ]);
    }

    /**
     * Creates a new B2bStoresPoints model.
     * If creation is successful, the browser will be redirected to the 'view' page.
     * @return mixed
     */
    public function actionCreate($store_id)
    {
        $model = new B2bStoresPoints();

        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            return $this->redirect(['/home']);
        } else {
            $model->store_id = $store_id;
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
            return $this->redirect(['view', 'id' => $model->id]);
        } else {
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
    public function actionDelete($id)
    {
        $this->findModel($id)->delete();

        return $this->redirect(['index']);
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
