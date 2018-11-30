<?php

namespace frontend\modules\product\controllers;

use shop\modules\category\models\ProductsCategory;
use shop\modules\product\models\ProductsToCategory;
use frontend\modules\params\models\ProductParameters;
use frontend\modules\params\models\ProductParametersValues;
use frontend\modules\stores\models\Cpa;
use frontend\modules\stores\models\Stores;
use frontend\modules\product\models\CatalogStores;
use Yii;
use shop\modules\product\models\Product;
use shop\modules\product\models\ProductSearch;
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
        //отключение дебаг панели
        if (class_exists('yii\debug\Module')) {
            Yii::$app->getModule('debug')->instance->allowedIPs = [];
            $this->off(\yii\web\View::EVENT_END_BODY, [\yii\debug\Module::getInstance(), 'renderToolbar']);
        }

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
                'category_id' => $category,
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
            $param['values'] = $values->all();
        }
        $categories = ProductsCategory::find()
            ->from(ProductsCategory::tableName(). ' pc')
            ->innerJoin(ProductsToCategory::tableName(). ' ptc', 'pc.id = ptc.category_id')
            ->select(['pc.*'])
            ->groupBy(['pc.*'])
            ->orderBy(['name'=>SORT_ASC])
            ->asArray()
            ->all();
        $categoriesFilter = [];
        foreach ($categories as $categoryItem) {
            $categoriesFilter[$categoryItem->id] = ProductsCategory::parentsTree($categoryItem);
        }
        asort($categoriesFilter);
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
                    if (preg_match('/^http(s?)\:\/\//', $model->image)) {
                        return '<img height="100" src="'.$model->image.'">';
                    }
                    $imageData = base64_encode(file_get_contents(Yii::getAlias('@shop/web/images/product/'.$model->image)));
                    return '<img height="100" src="data: jpeg;base64,'.$imageData.'">';
                },
                'url' => function ($model) {
                    return '<a href="'.$model->url.'" target="_blank" rel="nooper nofollow noreferrer">'.$model->url.'</a>';
                },
                'params' => function ($model) {
                    $out = [];
                    if ($model->params) {
                        foreach ($model->params as $param => $values) {
                            $out[] = $param . ':' . implode(';', $values);
                        }
                    }
                    return !empty($out) ? implode('<br>', $out) : '';
                }
            ],
            'availableFilter' => $this->availableFilter(),
            'categories' => $categoriesFilter,
            'params'=>$params,
            'get' => !empty($get['ProductSearch']) ? $get['ProductSearch'] : [],
            'filterStores' => ArrayHelper::map(
                Stores::find()->select(['cw_stores.uid', 'cw_stores.name'])
                    ->innerJoin(Product::tableName().' p', 'p.store_id = cw_stores.uid')
                    ->groupBy(['cw_stores.uid', 'cw_stores.name'])
                    ->asArray()->all(),
                'uid',
                'name'
            ),
            'filterCatalog' => ArrayHelper::map(
                CatalogStores::find()->from(CatalogStores::tableName().' cs')->select(['cs.id', 'cs.name'])
                    ->innerJoin(Product::tableName().' p', 'p.catalog_id = cs.id')->asArray()->all(),
                'id',
                'name'
            ),
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

        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            //return $this->redirect(['update', 'id' => $model->id]);
            return $this->redirect(['index']);
        } else {
            if (!$model->image) {
                $img = '';
            } else if (preg_match('/^http(s?)\:\/\//', $model->image)) {
                $img = $model->image;
            } else {
                $imageData = base64_encode(file_get_contents(Yii::getAlias('@shop/web/images/product/'.$model->image)));
                $img = 'data: jpeg;base64,'.$imageData;
            }
            return $this->render('update.twig', [
                'model' => $model,
                'img' => $img,
                'availableFilter' => $this->availableFilter(),
                'product_categories_data' => ProductsCategory::categoriesJson(),
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

    protected function availableFilter()
    {
        return [
            Product::PRODUCT_AVAILABLE_YES => 'В наличии',
            Product::PRODUCT_AVAILABLE_NOT => 'Нет в наличии',
            Product::PRODUCT_AVAILABLE_REQUEST => 'По запросу'
        ];
    }
}
