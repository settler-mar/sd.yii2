<?php

namespace frontend\modules\params\controllers;

use Yii;
use frontend\modules\params\models\ProductParameters;
use frontend\modules\params\models\ProductParametersSearch;
use frontend\modules\params\models\ProductParametersSynonyms;
use frontend\modules\params\models\ProductParametersValues;
use frontend\modules\product\models\ProductsCategory;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;
use yii\helpers\ArrayHelper;

/**
 * AdminController implements the CRUD actions for ProductParameters model.
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

    function beforeAction($action)
    {
        $this->layout = '@app/views/layouts/admin.twig';
        return true;
    }

    /**
     * Lists all ProductParameters models.
     * @return mixed
     */
    public function actionIndex()
    {
        if (Yii::$app->user->isGuest || !Yii::$app->user->can('ParamsView')) {
            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
            return false;
        }

        $searchModel = new ProductParametersSearch();
        $dataProvider = $searchModel->search(Yii::$app->request->queryParams);

        return $this->render('index.twig', [
            'searchModel' => $searchModel,
            'dataProvider' => $dataProvider,
            'activeFilter' => $this->activeFilter(),
            'tableData' => [
                'active' => function ($model) {
                    switch ($model->active) {
                        case ($model::PRODUCT_PARAMETER_ACTIVE_NO):
                            return '<span class="status_1"><span class="fa fa-times"></span>&nbsp;Неактивен</span>';
                        case ($model::PRODUCT_PARAMETER_ACTIVE_YES):
                            return '<span class="status_2"><span class="fa fa-check"></span>&nbsp;Активен</span>';
                        default:
                            return '<span class="status_0"><span class="fa fa-clock-o"></span>&nbsp;Ожидает проверки</span>';
                    }
                },
                'values' => function ($model) {
                    $out = '';
                    $loop = 0;
                    if ($model->values) {
                        foreach ($model->values as $value) {
                            $out .= $loop ? ', ' : '';
                            $out .= ('<span class="' . ProductParameters::activeClass($value->active) . '">' . $value->name . '</span>');
                            $loop++;
                        }
                    }
                    return $out;
                },
                'categories' => function ($model) {
                    $out = '';
                    if ($model->categories) {
                        foreach ($model->categories as $category) {
                            $productCategory = ProductsCategory::findOne($category);
                            $out .= ($productCategory ? $productCategory->name .'; ' : '');
                        }
                    }
                    return $out;
                },
                'synonym_name' => function ($model) {
                    return $model->synonymParam ? $model->synonymParam->name.' ('.$model->synonymParam->id.')' : '';
                }
            ],
            'product_categories' => array_merge([0=>'Не задано'], ArrayHelper::map(
                ProductsCategory::find()->select(['id', 'name'])->asArray()->all(),
                'id',
                'name'
            )),
            'parameter_filter' => array_merge(
                [0=>'Не задано'],
                arrayHelper::map(
                    ProductParameters::find()->select(['id', 'name'])->asArray()->all(),
                    'id',
                    'name'
                )
            ),

        ]);
    }

    /**
     * Displays a single ProductParameters model.
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
     * Creates a new ProductParameters model.
     * If creation is successful, the browser will be redirected to the 'view' page.
     * @return mixed
     */
//    public function actionCreate()
//    {
//        $model = new ProductParameters();
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
     * Updates an existing ProductParameters model.
     * If update is successful, the browser will be redirected to the 'view' page.
     * @param integer $id
     * @return mixed
     */
    public function actionUpdate($id)
    {
        if (Yii::$app->user->isGuest || !Yii::$app->user->can('ParamsEdit')) {
            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
            return false;
        }
        $model = $this->findModel($id);

        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            return $this->redirect(['index']);
        } else {
            return $this->render('update.twig', [
                'model' => $model,
                'activeFilter' => $this->activeFilter(),
                'possible_synonym' => arrayHelper::map(
                    ProductParameters::find()->select(['id', 'name'])->where(['<>', 'id', $id])->asArray()->all(),
                    'id',
                    'name'
                ),
                'product_categories_tree' => ProductsCategory::tree(),
            ]);
        }
    }

    /**
     * Deletes an existing ProductParameters model.
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
     * Finds the ProductParameters model based on its primary key value.
     * If the model is not found, a 404 HTTP exception will be thrown.
     * @param integer $id
     * @return ProductParameters the loaded model
     * @throws NotFoundHttpException if the model cannot be found
     */
    protected function findModel($id)
    {
        if (($model = ProductParameters::findOne($id)) !== null) {
            return $model;
        } else {
            throw new NotFoundHttpException('The requested page does not exist.');
        }
    }

    protected function activeFilter()
    {
        return [
            ProductParameters::PRODUCT_PARAMETER_ACTIVE_NO => 'Неактивен',
            ProductParameters::PRODUCT_PARAMETER_ACTIVE_YES => 'Активен',
            ProductParameters::PRODUCT_PARAMETER_ACTIVE_WAITING => 'Ожидает проверки',
        ];
    }
}
