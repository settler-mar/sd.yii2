<?php

namespace frontend\modules\product\controllers;

use Yii;
use frontend\modules\product\models\ProductsCategory;
use frontend\modules\product\models\ProductsCategorySearch;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;
use yii\helpers\ArrayHelper;

/**
 * AdminCategoryController implements the CRUD actions for ProductsCategory model.
 */
class AdminCategoryController extends Controller
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
     * Lists all ProductsCategory models.
     * @return mixed
     */
    public function actionIndex()
    {
        if (Yii::$app->user->isGuest || !Yii::$app->user->can('ProductView')) {
            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
            return false;
        }

        $searchModel = new ProductsCategorySearch();
        $dataProvider = $searchModel->search(Yii::$app->request->queryParams);

        return $this->render('index.twig', [
            'searchModel' => $searchModel,
            'dataProvider' => $dataProvider,
            'tableData' => [
                'parent' => function ($model) {
                    $parent = ProductsCategory::findOne($model->parent);
                    return $parent ? $parent->name.' ('.$parent->id.')' : '';
                },
                'active' => function ($model) {
                    switch ($model->active) {
                        case (ProductsCategory::PRODUCT_CATEGORY_ACTIVE_YES):
                            return 'Активна';
                        case (ProductsCategory::PRODUCT_CATEGORY_ACTIVE_NOT):
                            return 'Не активна';
                        default:
                            return 'Ожидает подтверждения';
                    }
                }
            ],
            'parents' => array_merge([0 => 'Нет родительской'], ArrayHelper::map(
                ProductsCategory::find()->select(['id', 'name'])->asArray()->all(),
                'id',
                'name'
            )),
            'activeFilter' => $this->activeFilter(),

        ]);
    }

    /**
     * Displays a single ProductsCategory model.
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
     * Creates a new ProductsCategory model.
     * If creation is successful, the browser will be redirected to the 'view' page.
     * @return mixed
     */
//    public function actionCreate()
//    {
//        $model = new ProductsCategory();
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
     * Updates an existing ProductsCategory model.
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
            $all = ArrayHelper::map(
                ProductsCategory::find()->where(['<>', 'id', $id])->select(['id', 'name'])->asArray()->all(),
                'id',
                'name'
            );

            return $this->render('update.twig', [
                'model' => $model,
                'all' => $all,
                'activeFilter' => $this->activeFilter(),
            ]);
        }
    }

    /**
     * Deletes an existing ProductsCategory model.
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
     * Finds the ProductsCategory model based on its primary key value.
     * If the model is not found, a 404 HTTP exception will be thrown.
     * @param integer $id
     * @return ProductsCategory the loaded model
     * @throws NotFoundHttpException if the model cannot be found
     */
    protected function findModel($id)
    {
        if (($model = ProductsCategory::findOne($id)) !== null) {
            return $model;
        } else {
            throw new NotFoundHttpException('The requested page does not exist.');
        }
    }

    protected function activeFilter()
    {
        return  [
            ProductsCategory::PRODUCT_CATEGORY_ACTIVE_YES => 'Активна',
            ProductsCategory::PRODUCT_CATEGORY_ACTIVE_NOT => 'Не активна',
            ProductsCategory::PRODUCT_CATEGORY_ACTIVE_WAITING => 'Ожидает подтверждения'
        ];
    }
}
