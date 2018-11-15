<?php

namespace frontend\modules\params\controllers;

use Yii;
use frontend\modules\params\models\ProductParametersValues;
use frontend\modules\params\models\ProductParameters;
use frontend\modules\params\models\ProductParametersValuesSearch;
use shop\modules\category\models\ProductsCategory;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;
use yii\helpers\ArrayHelper;

/**
 * AdminValuesController implements the CRUD actions for ProductParametersValues model.
 */
class AdminValuesController extends Controller
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
     * Lists all ProductParametersValues models.
     * @return mixed
     */
//    public function actionIndex()
//    {
//        if (Yii::$app->user->isGuest || !Yii::$app->user->can('ParamsView')) {
//            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
//            return false;
//        }
//        $searchModel = new ProductParametersValuesSearch();
//        $dataProvider = $searchModel->search(Yii::$app->request->queryParams);
//        return $this->render('index.twig', [
//            'searchModel' => $searchModel,
//            'dataProvider' => $dataProvider,
//            'activeFilter' => $this->activeFilter(),
//            'parameterFilter' => $this->parameterList(),
//            'tableData' => [
//                'active' => function ($model) {
//                    switch ($model->active) {
//                        case ($model::PRODUCT_PARAMETER_VALUES_ACTIVE_NO):
//                            return '<span class="status_1"><span class="fa fa-times"></span>&nbsp;Неактивен</span>';
//                        case ($model::PRODUCT_PARAMETER_VALUES_ACTIVE_YES):
//                            return '<span class="status_2"><span class="fa fa-check"></span>&nbsp;Активен</span>';
//                        default:
//                            return '<span class="status_0"><span class="fa fa-clock-o"></span>&nbsp;Ожидает проверки</span>';
//                    }
//                },
//                'categories' => function ($model) {
//                    $out = '';
//                    if ($model->categories) {
//                        foreach ($model->categories as $key => $category) {
//                            $productCategory = ProductsCategory::findOne($category);
//                            $out .= ($productCategory ? ($key ? '; ':'') . $productCategory->name : '');
//                        }
//                    }
//                    return $out;
//                },
//                'synonym_name' => function ($model) {
//                    return $model->synonymValue ? $model->synonymValue->name.' ('.$model->synonymValue->id.')' : '';
//                },
//                'synonyms' => function ($model) {
//                    return implode('; ', array_column($model->synonyms, 'name'));
//                },
//                'parameter' => function($model) {
//                    $out = '<a href="/admin/params/update/id:'.$model->parameter->id.'">';
//                    switch ($model->active) {
//                        case (ProductParameters::PRODUCT_PARAMETER_ACTIVE_NO):
//                            $out .= ('<span class="status_1">'.$model->parameter->name.'</span>');
//                            break;
//                        case (ProductParameters::PRODUCT_PARAMETER_ACTIVE_YES):
//                            $out .= ('<span class="status_2">'.$model->parameter->name.'</span>');
//                            break;
//                        default:
//                            $out .= ('<span class="status_0">'.$model->parameter->name.'</span>');
//                    }
//                    return $out . '</a>';
//                }
//
//            ],
//            'product_categories' => array_merge([0=>'Не задано'], ArrayHelper::map(
//                ProductsCategory::find()->select(['id', 'name'])->asArray()->all(),
//                'id',
//                'name'
//            )),
//
//        ]);
//    }

    /**
     * Displays a single ProductParametersValues model.
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
     * Creates a new ProductParametersValues model.
     * If creation is successful, the browser will be redirected to the 'view' page.
     * @return mixed
     */
//    public function actionCreate()
//    {
//        $model = new ProductParametersValues();
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
     * Updates an existing ProductParametersValues model.
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
            return $this->redirect(['/params/admin']);
        } else {
            $valuesList = ArrayHelper::map(
                ProductParametersValues::find()
                    ->where(['parameter_id'=>$model->parameter_id])
                    ->andWhere(['<>', 'id', $id])
                    ->andWhere(['synonym' => null])
                    ->asArray()->all(),
                'id',
                'name'
            );
            return $this->render('update.twig', [
                'model' => $model,
                'activeFilter' => $this->activeFilter(),
                'parameterList' => $this->parameterList(),
                'valuesList' => $valuesList,
                'product_categories_tree' => ProductsCategory::tree(),
            ]);
        }
    }

    /**
     * Deletes an existing ProductParametersValues model.
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
     * Finds the ProductParametersValues model based on its primary key value.
     * If the model is not found, a 404 HTTP exception will be thrown.
     * @param integer $id
     * @return ProductParametersValues the loaded model
     * @throws NotFoundHttpException if the model cannot be found
     */
    protected function findModel($id)
    {
        if (($model = ProductParametersValues::findOne($id)) !== null) {
            return $model;
        } else {
            throw new NotFoundHttpException('The requested page does not exist.');
        }
    }

    protected function activeFilter()
    {
        return [
            ProductParametersValues::PRODUCT_PARAMETER_VALUES_ACTIVE_NO => 'Неактивен',
            ProductParametersValues::PRODUCT_PARAMETER_VALUES_ACTIVE_YES => 'Активен',
            ProductParametersValues::PRODUCT_PARAMETER_VALUES_ACTIVE_WAITING => 'Ожидает проверки',
        ];
    }

    protected function parameterList($disableInActive = false)
    {
        $parameters = ProductParameters::find()->select(['id', 'name'])->asArray();
        if ($disableInActive) {
            $parameters->where(['active'=>[
                ProductParameters::PRODUCT_PARAMETER_ACTIVE_YES,
                ProductParameters::PRODUCT_PARAMETER_ACTIVE_WAITING
            ]]);
        }
        return ArrayHelper::map($parameters->all(), 'id', 'name');
    }
}
