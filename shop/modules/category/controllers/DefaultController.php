<?php

namespace shop\modules\category\controllers;

use yii\web\Controller;
use shop\modules\product\models\Product;
use shop\modules\category\models\ProductsCategory;
use frontend\modules\params\models\ProductParameters;
use frontend\modules\params\models\ProductParametersValues;
use frontend\components\Pagination;
use frontend\components\SdController;
use yii;

class DefaultController extends SdController
{
    public $category = null;

    public function beforeAction($action)
    {
        if (isset(Yii::$app->params['catalog_category'])) {
            $this->category = Yii::$app->params['catalog_category'];
            Yii::$app->params['url_mask'] = 'category/*';
        }
        return parent::beforeAction($action);
    }


    public function actionIndex()
    {
        $request = Yii::$app->request;

        $page = $request->get('page');
        $limit = $request->get('limit');
        $sort = $request->get('sort');

        $sortvars = Product::sortvars();
        $defaultSort = Product::$defaultSort;

        $validator = new \yii\validators\NumberValidator();
        $validatorIn = new \yii\validators\RangeValidator(['range' => array_keys($sortvars)]);
        if (!empty($limit) && !$validator->validate($limit) ||
            !empty($page) && !$validator->validate($page) ||
            !empty($sort) && !$validatorIn->validate($sort)
        ) {
            throw new \yii\web\NotFoundHttpException;
        };

        $sort = (!empty($sort)) ? $sort : Product::$defaultSort;
        $limit = (!empty($limit)) ? $limit : Product::$defaultLimit;
        $order = !empty($sortvars[$sort]['order']) ? $sortvars[$sort]['order'] : 'DESC';

        $this->params['breadcrumbs'][] = ['label' => Yii::t('main', 'category_product'), 'url' => ('/category')];

        $storesData = [];
        $dataBaseData = Product::find()
            ->from(Product::tableName() . ' prod')
            ->where(['prod.available' => [Product::PRODUCT_AVAILABLE_YES, Product::PRODUCT_AVAILABLE_REQUEST]])
            ->select(['prod.*'])
            ->orderBy($sort . ' ' . $order);
        $language = Yii::$app->language  == Yii::$app->params['base_lang'] ? false : Yii::$app->language;
        $region = Yii::$app->params['region']  == 'default' ? false : Yii::$app->params['region'];
        $cacheName = 'catalog_product_' . $page . '_' . $limit . '_' . $sort . '_' . $order .
            ($language ? '_' . $language : '') . ($region? '_' . $region : '');


        $filters = ProductParameters::find()
            ->where(['active' => ProductParameters::PRODUCT_PARAMETER_ACTIVE_YES])
            ->select(['id', 'name'])
            ->asArray();

        if ($this->category) {
            //есть категория
            //категории товара в т.ч. дочерние
            $allCategories = ProductsCategory::childsId($this->category->id);
            $this->params['breadcrumbs'][] = [
                'label' => $this->category->name,
                'url' => ('/category/' . $this->category->route),
            ];
            //получить в т.ч. по дочерним категориям
            $dataBaseData->innerJoin('cw_products_to_category pc', 'prod.id = pc.product_id')
                ->andWhere(['pc.category_id' => $allCategories]);

            $cacheName .= '_category_' . $this->category->route;
//            $filterParamCategory = [];
//            //параметры в т.ч. по дочерним категориям ??
//            foreach($allCategories as $cat) {
//                $filterParamCategory[] = 'JSON_CONTAINS('.ProductParameters::tableName().'.categories,\'"'.$cat.'"\',"$")';
//            }
            //$filters->andWhere(array_merge(['or', ['categories' => null]], $filterParamCategory));
        }
//        $filters = $filters->all();
//        foreach ($filters as &$filter) {
//            $values = ProductParametersValues::find()
//                ->select(['id', 'name'])
//                ->where(['parameter_id' => $filter['id'], 'active'=>ProductParametersValues::PRODUCT_PARAMETER_VALUES_ACTIVE_YES])
//                ->asArray();
//            if ($this->category) {
//                //значения в т.ч. по дочерним ??
//                $filterParamCategory = [];
//                foreach($allCategories as $cat) {
//                    $filterParamCategory[] = 'JSON_CONTAINS('.ProductParametersValues::tableName().'.categories,\'"'.$cat.'"\',"$")';
//                }
//                $values->andWhere(array_merge(['or', ['categories' => null]], $filterParamCategory));
//            }
//            $filter['values'] = $values->all();
//        }
        $storeData['filter'] = $filters;
        //ddd($filters);

        $pagination = new Pagination(
            $dataBaseData,
            $cacheName,
            ['limit' => $limit, 'page' => $page]
        );

        $storesData['category'] = $this->category;
        $storesData['products'] = $pagination->data();
        $storesData["total_v"] = $pagination->count();
        $storesData["total_all_product"] = Product::activeCount();
        $storesData["page"] = empty($page) ? 1 : $page;
        $storesData["show_products"] = count($storesData['products']);
        $storesData["offset_products"] = $pagination->offset();
        $storesData["limit"] = empty($limit) ? Product::$defaultLimit : $limit;

        $paginateParams = [
            //'limit' => $this->defaultLimit == $limit ? null : $limit,
            'limit' => $limit,
            //'sort' => $defaultSort == $sort ? null : $sort,
            'sort' => $sort,
            'page' => $page,

        ];

        $paginatePath = '/' . 'category'. ($this->category ? '/' . ProductsCategory::parentsTree($this->category, true) : '');

        if ($pagination->pages() > 1) {
            $storesData["pagination"] = $pagination->getPagination($paginatePath, $paginateParams);
            //$this->makePaginationTags($paginatePath, $pagination->pages(), $page, $paginateParams);
        }
        if ($page > 1) {
            $this->params['breadcrumbs'][] = Yii::t('main', 'breadcrumbs_page').' ' . $page;
        }

        $storesData['sortlinks'] =
            $this->getSortLinks($paginatePath, $sortvars, $defaultSort, $paginateParams);
//        $storesData['limitlinks'] =
//            $this->getLimitLinks($paginatePath, $defaultSort, $paginateParams);

        return $this->render('index', $storesData);
    }

    public function actionProduct($id)
    {
        $product = Product::findOne($id);
        if (!$product) {
            throw new yii\web\NotFoundHttpException();
        }
        Yii::$app->params['url_mask'] = 'category/product/*';
        return $this->render('product', [
            'product' => $product,
        ]);

    }


}
