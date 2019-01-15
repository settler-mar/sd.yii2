<?php

namespace frontend\modules\vendor\controllers;

use Yii;
use frontend\modules\vendor\models\Vendor;
use frontend\modules\vendor\models\VendorSearch;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;

/**
 * AdminController implements the CRUD actions for Vendor model.
 */
class AdminController extends Controller
{
    public function behaviors()
    {
        return [
            'verbs' => [
                'class' => VerbFilter::className(),
                'actions' => [
                    'delete' => ['POST'],
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
     * Lists all Vendor models.
     * @return mixed
     */
    public function actionIndex()
    {
        if (Yii::$app->user->isGuest || !Yii::$app->user->can('VendorView')) {
            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
            return false;
        }

        $searchModel = new VendorSearch();
        $dataProvider = $searchModel->search(Yii::$app->request->queryParams);

        return $this->render('index', [
            'searchModel' => $searchModel,
            'dataProvider' => $dataProvider,
            'tableData' => [
                'status' => function($model) {
                    switch ($model->status) {
                        case (Vendor::STATUS_OFF):
                            $label = 'Неактивен';
                            break;
                        case (Vendor::STATUS_ACTIVE):
                            $label = 'Активен';
                            break;
                        default:
                            $label = 'Ожидает подтверждения';
                    }
                    return '<span class="'.Vendor::statusClass($model->status).'">'.$label.'</span>';
                },
                'name' => function($model) {
                    return '<a href="/admin/vendor/update/id:'.$model->id.'"><span class="'.
                        Vendor::statusClass($model->status).'">'.$model->name.'</span></a>';
                },
                'synonym' => function($model) {
                    $synonym = $model->synonymVendor;
                    if ($synonym) {
                        return '<a href="/admin/vendor/update/id:' . $synonym->id . '"><span class="' .
                            Vendor::statusClass($synonym->status) . '">' . $synonym->name . ' ('.$synonym->id.')</span></a>';
                    }
                },
                'logo' => function ($model) {
                    if ($model->logo) {
                        return '<img style="max-width: 100%;max-height:100px;" src="'.$model->imagePath.$model->logo.'"/>';
                    }
                }

            ],
        ]);
    }

    /**
     * Displays a single Vendor model.
     * @param integer $id
     * @return mixed
     */
//    public function actionView($id)
//    {
//        return $this->render('view', [
//            'model' => $this->findModel($id),
//        ]);
//    }

    /**
     * Creates a new Vendor model.
     * If creation is successful, the browser will be redirected to the 'view' page.
     * @return mixed
     */
//    public function actionCreate()
//    {
//        $model = new Vendor();
//
//        if ($model->load(Yii::$app->request->post()) && $model->save()) {
//            return $this->redirect(['view', 'id' => $model->id]);
//        } else {
//            return $this->render('create', [
//                'model' => $model,
//            ]);
//        }
//    }

    /**
     * Updates an existing Vendor model.
     * If update is successful, the browser will be redirected to the 'view' page.
     * @param integer $id
     * @return mixed
     */
    public function actionUpdate($id)
    {
        if (Yii::$app->user->isGuest || !Yii::$app->user->can('VendorView')) {
            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
            return false;
        }

        $model = $this->findModel($id);

        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            return $this->redirect(['index']);
        } else {
            return $this->render('update', [
                'model' => $model,
            ]);
        }
    }

    /**
     * Deletes an existing Vendor model.
     * If deletion is successful, the browser will be redirected to the 'index' page.
     * @param integer $id
     * @return mixed
     */
    public function actionDelete($id)
    {
        if (Yii::$app->user->isGuest || !Yii::$app->user->can('VendorDelete')) {
            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
            return false;
        }

        $this->findModel($id)->delete();

        return $this->redirect(['index']);
    }

    /**
     * Finds the Vendor model based on its primary key value.
     * If the model is not found, a 404 HTTP exception will be thrown.
     * @param integer $id
     * @return Vendor the loaded model
     * @throws NotFoundHttpException if the model cannot be found
     */
    protected function findModel($id)
    {
        if (($model = Vendor::findOne($id)) !== null) {
            return $model;
        } else {
            throw new NotFoundHttpException('The requested page does not exist.');
        }
    }
}
