<?php

namespace frontend\modules\params\controllers;

use Yii;
use frontend\modules\params\models\ProductParameters;
use frontend\modules\params\models\ProductParametersSearch;
use frontend\modules\params\models\ProductParametersValues;
use shop\modules\category\models\ProductsCategory;
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
        $parameterFilter = [];
        $parameters = ProductParameters::find()->orderBy(['name' => SORT_ASC])->all();
        foreach ($parameters as $parameter) {
            $parameterFilter[$parameter->id] = $parameter->CategoryTree.$parameter->code.'('.$parameter->id.')';
        }

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
                    if ($model->values) {
                        foreach ($model->values as $key => $value) {
                            $out .= $key ? '; ' : '';
                            $out .= ('<a href="/admin-values/params/update/id:'.$value->id.'"><span class="' . ProductParameters::activeClass($value->active) . '">' . $value->name . '</span></a>');
                        }
                    }
                    return $out;
                },
                'categories' => function ($model) {
                    $out = array();
                    if ($model->category) {
                        $categories = ProductsCategory::parents([$model->category]);
                        for ($i = count($categories) - 1; $i >= 0; $i--) {
                            $item = '<a href="/admin-category/product/update/id:'.$categories[$i]->id.'">';
                            switch ($categories[$i]->active) {
                                case (ProductsCategory::PRODUCT_CATEGORY_ACTIVE_NOT):
                                  $item .= '<span class="status_1">';
                                    break;
                                case (ProductsCategory::PRODUCT_CATEGORY_ACTIVE_YES):
                                  $item .= '<span class="status_2">';
                                    break;
                                default:
                                  $item .= '<span class="status_0">';
                            }
                          $item .= $categories[$i]->name;
                          $item .= '</span></a>';
                          $out[]=$item;
                        }
                    }
                    return implode(' / ', $out);
                },
                'synonym_name' => function ($model) {
                    return $model->synonymParam ? $model->synonymParam->categoryTree.$model->synonymParam->name.' ('.$model->synonymParam->id.')' : '';
                },
                'code' => function ($model) {
                    $out = '<span';
                    if ($model->synonyms) {
                        $out .= ' style="cursor:pointer" title="Синонимы: ';
                        foreach ($model->synonyms as $key => $synonym) {
                            $out .= ($key ? ',':'');
                            $out .= $synonym->code;
                        }
                        $out .= '"';
                    }
                    $out .= '>'.$model->code.'</span>';
                    return $out;
                }
            ],
            'product_categories' => [0=>'Не задано'] + ArrayHelper::map(
                ProductsCategory::find()->select(['id', 'name'])->asArray()->orderBy(['name' => SORT_ASC])->all(),
                'id',
                'name'
            ),
            'synonym_filter' => ['-1' => 'Нет', '0' => 'Любое значение'] + $parameterFilter,

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
                    ProductParameters::find()->select(['id', 'name'])
                        ->where(['<>', 'id', $id])
                        ->andWhere(['category_id' => $model->category_id])
                        ->orderBy(['name' => SORT_ASC])->asArray()->all(),
                    'id',
                    'name'
                ),
                //'product_categories_tree' => ProductsCategory::tree(),
                'product_categories' => ArrayHelper::map(
                    ProductsCategory::find()->select(['id', 'name'])->asArray()->orderBy(['name' => SORT_ASC])->all(),
                    'id',
                    'name'
                ),
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
