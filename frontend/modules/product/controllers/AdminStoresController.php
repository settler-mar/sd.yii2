<?php

namespace frontend\modules\product\controllers;

use Yii;
use frontend\modules\product\models\CatalogStores;
use frontend\modules\product\models\CatalogStoresSearch;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;
use yii\helpers\ArrayHelper;
use frontend\modules\stores\models\Cpa;

/**
 * AdminStoresController implements the CRUD actions for CatalogStores model.
 */
class AdminStoresController extends Controller
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

    function beforeAction($action)
    {
        $this->layout = '@app/views/layouts/admin.twig';
        return true;
    }

    /**
     * Lists all CatalogStores models.
     * @return mixed
     */
    public function actionIndex()
    {
        if (Yii::$app->user->isGuest || !Yii::$app->user->can('ProductView')) {
            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
            return false;
        }
        $searchModel = new CatalogStoresSearch();
        $dataProvider = $searchModel->search(Yii::$app->request->queryParams);

        return $this->render('index.twig', [
            'searchModel' => $searchModel,
            'dataProvider' => $dataProvider,
            'tableData' => [
                'active' => function ($model) {
                    switch ($model->active) {
                        case ($model::CATALOG_STORE_ACTIVE_YES):
                            return 'Активен';
                        case ($model::CATALOG_STORE_ACTIVE_NOT):
                            return 'Не активен';
                        default:
                            return 'Ожидает подтверждения';

                    }
                },
            ],
            'activeFilter' => [
                CatalogStores::CATALOG_STORE_ACTIVE_YES => 'Активен',
                CatalogStores::CATALOG_STORE_ACTIVE_NOT => 'Не активен',
                CatalogStores::CATALOG_STORE_ACTIVE_WAITING => 'Ожидает подтверждения'
            ],
            'cpaFilter' => ArrayHelper::map(
                Cpa::find()->from(Cpa::tableName().' cpa')->select(['cpa.id', 'name'])
                     ->innerJoin(CatalogStores::tableName().' cs', 'cs.cpa_id=cpa.id')
                     ->asArray()->all(),
                'id',
                'name'
            ),
        ]);
    }

    /**
     * Displays a single CatalogStores model.
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
     * Creates a new CatalogStores model.
     * If creation is successful, the browser will be redirected to the 'view' page.
     * @return mixed
     */
//    public function actionCreate()
//    {
//        $model = new CatalogStores();
//
//        if ($model->load(Yii::$app->request->post()) && $model->save()) {
//            return $this->redirect(['view', 'id' => $model->id]);
//        } else {
//            return $this->render('create.twig', [
//                'model' => $model,
//            ]);
//        }
//    }

    /**
     * Updates an existing CatalogStores model.
     * If update is successful, the browser will be redirected to the 'view' page.
     * @param integer $id
     * @return mixed
     */
    public function actionUpdate($id)
    {
        if (Yii::$app->user->isGuest || !Yii::$app->user->can('ProductEdit')) {
            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
            return false;
        }
        $model = $this->findModel($id);

        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            return $this->redirect(['index']);
        } else {
            return $this->render('update.twig', [
                'model' => $model,
                'activeFilter' => [
                    CatalogStores::CATALOG_STORE_ACTIVE_YES => 'Активен',
                    CatalogStores::CATALOG_STORE_ACTIVE_NOT => 'Не активен',
                    CatalogStores::CATALOG_STORE_ACTIVE_WAITING => 'Ожидает подтверждения'
                ],
            ]);
        }
    }

    /**
     * Deletes an existing CatalogStores model.
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
     * Finds the CatalogStores model based on its primary key value.
     * If the model is not found, a 404 HTTP exception will be thrown.
     * @param integer $id
     * @return CatalogStores the loaded model
     * @throws NotFoundHttpException if the model cannot be found
     */
    protected function findModel($id)
    {
        if (($model = CatalogStores::findOne($id)) !== null) {
            return $model;
        } else {
            throw new NotFoundHttpException('The requested page does not exist.');
        }
    }
}
