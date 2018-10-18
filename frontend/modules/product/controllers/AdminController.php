<?php

namespace frontend\modules\product\controllers;

use frontend\modules\product\models\ProductsCategory;
use frontend\modules\params\models\ProductParameters;
use frontend\modules\params\models\ProductParametersValues;
use Yii;
use frontend\modules\product\models\Product;
use frontend\modules\product\models\ProductSearch;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;
use yii\helpers\ArrayHelper;

/**
 * AdminController implements the CRUD actions for Product model.
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
     * Lists all Product models.
     * @return mixed
     */
    public function actionIndex()
    {
        $get = Yii::$app->request->get();
        if (Yii::$app->user->isGuest || !Yii::$app->user->can('ProductView')) {
            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
            return false;
        }
        $searchModel = new ProductSearch();
        $dataProvider = $searchModel->search(Yii::$app->request->queryParams);
        $category = empty($get['ProductSearch']['product_categories']) ? false :
            $get['ProductSearch']['product_categories'];

        //нужно ли включить в выборку параметров родительские категории??? или наоборот, дочерние??

        //параметры с учётом фильтра по категориям
        $params = ProductParameters::find()
            ->where(['<>', 'active', ProductParameters::PRODUCT_PARAMETER_ACTIVE_NO])
            ->select(['id', 'name'])
            ->asArray();
        if ($category) {
            $params->andWhere([
                'or',
                ['categories' => null],
                'JSON_CONTAINS(categories,\'"'.$category.'"\',"$")'
            ]);
        }
        $params = $params->all();
        foreach ($params as &$param) {
            //для каждого параметра его значения с учётом фильтра по категориям
            $values = ProductParametersValues::find()
                ->select(['id', 'name'])
                ->where(['<>', 'active', ProductParametersValues::PRODUCT_PARAMETER_VALUES_ACTIVE_NO])
                ->andWhere(['parameter_id' => $param['id']])
                ->asArray();
            if ($category) {
                $values->andWhere([
                    'or',
                    ['categories' => null],
                    'JSON_CONTAINS(categories,\'"'.$category.'"\',"$")'
                ]);
            }
            $param['values'] = $values->all();
        }

        return $this->render('index.twig', [
            'searchModel' => $searchModel,
            'dataProvider' => $dataProvider,
            'tableData' => [
                'available' => function ($model) {
                    switch ($model->available) {
                        case ($model::PRODUCT_AVAILABLE_NOT):
                            return 'Нет в наличии';
                        case ($model::PRODUCT_AVAILABLE_YES):
                            return 'В наличии';
                        default:
                            return 'По запросу';
                    }
                },
                'image' => function ($model) {
                    if (!$model->image) {
                        return '';
                    }
                    $src = (preg_match('/^http(s?)\:\/\//', $model->image)) ? $model->image :
                        '/images/product/'.$model->image;
                    return '<img height="100" src="'.$src.'">';
                },
                'categories' => function ($model) {
                    $out = '';
                    $loop = 0;
                    foreach ($model->categories as $category) {
                        $out .= $category->name;
                        $loop++;
                        $out .= ($loop<count($model->categories) ? '<br>' : '');
                    }
                    return $out;
                },
                'url' => function ($model) {
                    return '<a href="'.$model->url.'" target="_blank" rel="nooper nofollow noreferrer">'.$model->url.'</a>';
                },
                'params' => function ($model) {
                    $out = '';
                    foreach ($model->params as $param=>$values) {
                        $out .= $param .':';
                        foreach ($values as $value) {
                            $out .= $value . ',';
                        }
                        $out .= '<br>';
                    }
                    return $out;
                }
            ],
            'availableFilter' => [
                $searchModel::PRODUCT_AVAILABLE_YES => 'В наличии',
                $searchModel::PRODUCT_AVAILABLE_NOT => 'Нет в наличии',
                $searchModel::PRODUCT_AVAILABLE_REQUEST => 'По запросу'
            ],
            'categories' => ArrayHelper::map(ProductsCategory::find()->asArray()->all(), 'id', 'name'),
            'params'=>$params,
            'get' => !empty($get['ProductSearch']) ? $get['ProductSearch'] : [],
        ]);
    }

    /**
     * Displays a single Product model.
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
     * Creates a new Product model.
     * If creation is successful, the browser will be redirected to the 'view' page.
     * @return mixed
     */
//    public function actionCreate()
//    {
//        $model = new Product();
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
     * Updates an existing Product model.
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
        $categories = ProductsCategory::find()->asArray()->all();
        $model_categories = array_column($model->categories, 'id');
        foreach ($categories as &$category) {
            $category['checked'] = in_array($category['id'], $model_categories);
        }

        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            return $this->redirect(['view', 'id' => $model->id]);
        } else {
            return $this->render('update.twig', [
                'model' => $model,
                'categories' => $categories,
                'img' => (preg_match('/^http(s?)\:\/\//', $model->image)) ? $model->image :
                    '/images/product/'.$model->image
            ]);
        }
    }

    /**
     * Deletes an existing Product model.
     * If deletion is successful, the browser will be redirected to the 'index' page.
     * @param integer $id
     * @return mixed
     */
    public function actionDelete($id)
    {
        if (Yii::$app->user->isGuest || !Yii::$app->user->can('ProductDelete')) {
            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
            return false;
        }
        $this->findModel($id)->delete();

        return $this->redirect(['index']);
    }

    /**
     * Finds the Product model based on its primary key value.
     * If the model is not found, a 404 HTTP exception will be thrown.
     * @param integer $id
     * @return Product the loaded model
     * @throws NotFoundHttpException if the model cannot be found
     */
    protected function findModel($id)
    {
        if (($model = Product::findOne($id)) !== null) {
            return $model;
        } else {
            throw new NotFoundHttpException('The requested page does not exist.');
        }
    }
}
