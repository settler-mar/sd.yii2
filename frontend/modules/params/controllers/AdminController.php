<?php

namespace frontend\modules\params\controllers;

use shop\modules\product\models\ProductsToCategory;
use Yii;
use frontend\modules\params\models\ProductParameters;
use frontend\modules\params\models\ProductParametersSearch;
use frontend\modules\params\models\ProductParametersValues;
use shop\modules\category\models\ProductsCategory;
use shop\modules\product\models\Product;
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
        //отключение дебаг панели
        if (class_exists('yii\debug\Module')) {
            Yii::$app->getModule('debug')->instance->allowedIPs = [];
            $this->off(\yii\web\View::EVENT_END_BODY, [\yii\debug\Module::getInstance(), 'renderToolbar']);
        }
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
        if ($searchModel->allCategories) {
            //выбрана категория - в фильтр выводим синонимы - без категрии их слишком много
            $parameters = ProductParameters::find()->where(['synonym' => null, 'category_id' => $searchModel->allCategories])->orderBy(['name' => SORT_ASC])->all();
            if ($parameters) {
                foreach ($parameters as $parameter) {
                    $parameterFilter[$parameter->id] = $parameter->CategoryTree. ' / '.$parameter->code.' ('.$parameter->id.')';
                }
            }
        }
        // все категории
        $categoriesFilter = ProductsCategory::forFilter();
        asort($categoriesFilter);

        return $this->render('index.twig', [
            'searchModel' => $searchModel,
            'dataProvider' => $dataProvider,
            'activeFilter' => $this->activeFilter(),
            'typeFilter' => $this->typeFilter(),
            'tableData' => [
                'active' => function ($model) {
                    $out = '<span class="'.ProductParameters::activeClass($model->active).'">';
                    switch ($model->active) {
                        case ($model::PRODUCT_PARAMETER_ACTIVE_NO):
                            $out .= '<span class="fa fa-times"></span>&nbsp;Неактивен</span>';
                            break;
                        case ($model::PRODUCT_PARAMETER_ACTIVE_YES):
                            $out .= '<span class="fa fa-check"></span>&nbsp;Активен</span>';
                            break;
                        default:
                            $out .= '<span class="fa fa-clock-o"></span>&nbsp;Ожидает проверки</span>';
                    }
                    return $out;
                },
                'type' => function ($model) {
                    switch ($model->parameter_type) {
                        case ($model::PRODUCT_PARAMETER_TYPE_DROPDOWN):
                            return 'Список';
                        case ($model::PRODUCT_PARAMETER_TYPE_INTEGER):
                            return 'Число';
                        default:
                            return 'Текст';
                    }
                },
                'values' => function ($model) {
                    $values = [];
                    if ($model->values) {
                        foreach ($model->values as $key => $value) {
                            if ($value->synonym != null) {
                                continue;
                            }
                            $valueStr = '<a href="/admin-values/params/update/id:'.$value->id.'">'.
                                '<span class="' . ProductParametersValues::activeClass($value->active) . '">' .
                                $value->name . '</span></a>';
                            /*$valueSynonyms = [];
                            if ($value->synonyms) {
                                foreach ($value->synonyms as $valueSynonym) {
                                    $valueSynonyms[] = '<a title="Синоним" href="/admin-values/params/update/id:'.$valueSynonym->id.'">'.
                                        '<span class="' . ProductParametersValues::activeClass($valueSynonym->active) .
                                        '">' . $valueSynonym->name . '</span></a>';
                                }
                            }*/
                            $values[] = $valueStr . (!empty($valueSynonyms)? '('.implode(';', $valueSynonyms).')': '');
                        }
                    }
                    $out = implode('; ', $values);//значения со своими синонимами
                    return $out;
                },
                'categories' => function ($model) {
                    if (isset($model->category_id)) {
                        return ProductsCategory::parentsTree($model->category, 2);
                    }
                },
                'synonym_name' => function ($model) {
                    return $model->synonymParam ? $model->synonymParam->categoryTree.$model->synonymParam->name .
                        ' ('.$model->synonymParam->id.')' : '';
                },
                'code' => function ($model) {
                    $out = '<a href="admin/params/update/id:'.$model->id.'"><span class="' .
                        ProductParameters::activeClass($model->active).'">'.$model->code.'</span></a>';
                    /*if ($model->synonyms) {
                        $synonyms = [];
                        foreach ($model->synonyms as $synonym) {
                            $synonyms[] = '<a title="Синоним '.$synonym->code.' '.$synonym->name.'" '.
                                'href="admin/params/update/id:'.$synonym->id.'">'.
                                '<span class="'.ProductParameters::activeClass($synonym->active).'">' .
                                $synonym->code.'</span></a>';
                        }
                        $out .= ' ('.implode('; ', $synonyms).')';
                    }*/
                    return $out;
                }
            ],
            'product_categories' => [0=>'Не задано'] + $categoriesFilter,
            'synonym_filter' => ['-1' => 'Нет', '0' => 'Любое значение'] + $parameterFilter,
            'product_categories_data' => ProductsCategory::categoriesJson(),

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
     * @return bool|string
     * @throws NotFoundHttpException
     * @throws \yii\web\ForbiddenHttpException
     */
    public function actionUpdateAll()
    {
        if (Yii::$app->user->isGuest || !Yii::$app->user->can('ParamsEdit')) {
            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
            return false;
        }
        $request = Yii::$app->request;
        if (!$request->isAjax) {
            throw new NotFoundHttpException();
        }
        $ids = $request->post('id');
        $active = $request->post('active');
        $data = [];
        if ($active !== '') {
            $data['active'] = in_array($active, [
                ProductParameters::PRODUCT_PARAMETER_ACTIVE_NO,
                ProductParameters::PRODUCT_PARAMETER_ACTIVE_YES,
                ProductParameters::PRODUCT_PARAMETER_ACTIVE_WAITING,
            ]) ? $active : ProductParameters::PRODUCT_PARAMETER_ACTIVE_WAITING;
        }
        $category_id = $request->post('category_id');
        if ($category_id !== '') {
            $data['category_id'] = (int)$category_id > 0 ? (int)$category_id : null;
        }
        $synonym = $request->post('synonym');
        if ($synonym !== '') {
            $data['synonym'] = (int)$synonym > 0 ? (int)$synonym : null;
        }

        $result = !empty($data) ? ProductParameters::updateAll($data, ['id' => $ids]) : 0;

        return json_encode(['error' => $result < 1]);
    }


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
            //для товаров в т.ч. дочерние категории ??
            $categoriesTree = ProductsCategory::tree();
            $childsId = ProductsCategory::getCategoryChilds($categoriesTree, $model->category_id);

            $products = Product::find()
                ->from(Product::tableName() . ' p')
                ->leftJoin(ProductsToCategory::tableName() . ' ptc', 'ptc.product_id = p.id')
                ->where('JSON_KEYS(params) LIKE \'%"' . $model->code . '"%\'')
                ->andWhere(['ptc.category_id' => $childsId])
                ->limit(5)->all();

            if (count($products)<5)  {
                $products = array_merge($products, Product::find()
                    ->from(Product::tableName() . ' p')
                    ->leftJoin(ProductsToCategory::tableName() . ' ptc', 'ptc.product_id = p.id')
                    ->andWhere(['ptc.category_id' => $childsId])
                    ->andWhere([
                        'or',
                        'params_original LIKE \'' . $model->code . ':%\'',
                        'params_original LIKE \'%|' . $model->code . ':%\''
                    ])
                    ->andWhere(['not in' ,'p.id', array_column($products, 'id')])
                    ->limit(5 - count($products))->all()
                );
            }

            return $this->render('update.twig', [
                'model' => $model,
                'activeFilter' => $this->activeFilter(),
                'typeFilter' => $this->typeFilter(),
                'possible_synonym' => arrayHelper::map(
                    ProductParameters::find()->select(['id', 'name'])
                        ->where(['<>', 'id', $id])
                        ->andWhere(['category_id' => $model->category_id])
                        ->orderBy(['name' => SORT_ASC])->asArray()->all(),
                    'id',
                    'name'
                ),
                'product_categories_data' => ProductsCategory::categoriesJson(),
                'products' => $products,
            ]);
        }
    }

    /**
     * @return bool|string
     * @throws NotFoundHttpException
     * @throws \yii\web\ForbiddenHttpException
     */
    public function actionList()
    {
        if (Yii::$app->user->isGuest || !Yii::$app->user->can('ParamsEdit')) {
            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
            return false;
        }
        $request = Yii::$app->request;
        if (!$request->isAjax) {
            throw new \yii\web\NotFoundHttpException();
            return false;
        }
        $category = $request->get('id');
        $self = $request->get('except');
        $list = ProductParameters::find()->where(['and', ['category_id' => $category], ['<>', 'id', $self]])
            ->select(['id', 'name'])->asArray()->all();
        return json_encode($list);
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
    protected function typeFilter()
    {
        return [
            ProductParameters::PRODUCT_PARAMETER_TYPE_DROPDOWN => 'Список',
            ProductParameters::PRODUCT_PARAMETER_TYPE_INTEGER => 'Число',
            ProductParameters::PRODUCT_PARAMETER_TYPE_TEXT => 'Текст',
        ];
    }
}
