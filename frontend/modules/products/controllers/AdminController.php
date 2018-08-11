<?php

namespace frontend\modules\products\controllers;

use Yii;
use frontend\modules\products\models\Products;
use frontend\modules\products\models\ProductsSearch;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;

/**
 * AdminController implements the CRUD actions for Products model.
 */
class AdminController extends Controller
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

    public function beforeAction($action)
    {
        $this->layout = '@app/views/layouts/admin.twig';
        return true;
    }

    /**
     * Lists all Products models.
     * @return mixed
     */
    public function actionIndex()
    {
        if (Yii::$app->user->isGuest || !Yii::$app->user->can('ProductsView')) {
            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
            return false;
        }
        $searchModel = new ProductsSearch();
        $dataProvider = $searchModel->search(Yii::$app->request->queryParams);

        return $this->render('index.twig', [
            'searchModel' => $searchModel,
            'dataProvider' => $dataProvider,
            'tableData' => [
                'storeName' => function ($model) {
                    return '<a href="'.$model->store->url.'" target="_blank">'.$model->store->name.'</a>';
                },
                'url' => function ($model) {
                    return '<a href="'.$model->url.'" target="_blank">'.$model->url.'</a>';
                },
                'image' => function ($model) {
                    if (!$model->image) {
                        return '';
                    }
                    return '<img style="object-fit:cover; max-width: 50px" src="'.
                        (strpos($model->image, 'http') !== 0 ? '/images/products/' : ''). $model->image.'">';
                }
            ],
        ]);
    }


    /**
     * Creates a new Products model.
     * If creation is successful, the browser will be redirected to the 'view' page.
     * @return mixed
     */
//    public function actionCreate()
//    {
//        $model = new Products();
//
//        if ($model->load(Yii::$app->request->post()) && $model->save()) {
//            //return $this->redirect(['edit', 'id' => $model->uid]);
//            return $this->redirect(['index']);
//        } else {
//            return $this->render('create.twig', [
//                'model' => $model,
//            ]);
//        }
//    }

    /**
     * Updates an existing Products model.
     * If update is successful, the browser will be redirected to the 'view' page.
     * @param integer $id
     * @return mixed
     */
    public function actionUpdate($id)
    {
        if (Yii::$app->user->isGuest || !Yii::$app->user->can('ProductsEdit')) {
            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
            return false;
        }
        $model = $this->findModel($id);

        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            return $this->redirect(['index']);
            //return $this->redirect(['edit', 'id' => $model->uid]);
        } else {
            return $this->render('update.twig', [
                'model' => $model,
            ]);
        }
    }

    /**
     * Deletes an existing Products model.
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
     * Finds the Products model based on its primary key value.
     * If the model is not found, a 404 HTTP exception will be thrown.
     * @param integer $id
     * @return Products the loaded model
     * @throws NotFoundHttpException if the model cannot be found
     */
    protected function findModel($id)
    {
        if (($model = Products::findOne($id)) !== null) {
            return $model;
        } else {
            throw new NotFoundHttpException('The requested page does not exist.');
        }
    }
}
