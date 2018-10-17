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
                'synonyms' => function ($model) {
                    $out = '';
                    $loop = 0;
                    foreach ($model->synonyms as $synonym) {
                        $out .= $loop ? ', ': '';
                        $out .= ('<span class="'.ProductParameters::activeClass($synonym->active).'">'.$synonym->text.'</span>');
                        $loop++;
                    }
                    return $out;
                },
                'values' => function ($model) {
                    $out = '';
                    $loop = 0;
                    foreach ($model->values as $value) {
                        $out .= $loop ? ', ': '';
                        $out .= ('<span class="'.ProductParameters::activeClass($value->active).'">'.$value->name.'</span>');
                        $loop++;
                    }
                    return $out;
                }
            ],
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
            $possibles = ProductParameters::find()
                ->where(['<>', 'id', $id])
                ->andWhere(['<>', 'active', ProductParameters::PRODUCT_PARAMETER_ACTIVE_NO])
                ->asArray()
                ->all();
            $synonyms = array_column($model->synonyms, 'text');
            foreach ($possibles as &$possible) {
                $possible['checked']= in_array($possible['code'], $synonyms);
            }
            $productCategories = ProductsCategory::find()->asArray()->all();
            foreach ($productCategories as &$category) {
                $category['checked'] = $model->categories && in_array($category['id'], $model->categories);
            }
            //ddd($productCategories);
            return $this->render('update.twig', [
                'model' => $model,
                'activeFilter' => $this->activeFilter(),
                'possibles' => $possibles,
                'product_categories' => $productCategories,
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
