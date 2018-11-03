<?php

namespace shop\modules\category\controllers;

use yii\web\Controller;
use shop\modules\product\models\Product;
use shop\modules\category\models\ProductsCategory;
use frontend\components\Pagination;
use frontend\components\SdController;
use yii;

class DefaultController extends SdController
{
    public $category = null;

    public function beforeAction($action)
    {
        $categoryRoute = explode('/', Yii::$app->request->pathInfo);
        if ($categoryRoute[0] == 'category' && count($categoryRoute) == 2) {
            $this->category = ProductsCategory::byRoute($categoryRoute[1]);
            if (!$this->category) {
                throw new yii\web\NotFoundHttpException();
            }
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
            ->select(['prod.*'])
            ->orderBy($sort . ' ' . $order);
        $language = Yii::$app->language  == Yii::$app->params['base_lang'] ? false : Yii::$app->language;
        $region = Yii::$app->params['region']  == 'default' ? false : Yii::$app->params['region'];
        $cacheName = 'catalog_product_' . $page . '_' . $limit . '_' . $sort . '_' . $order .
            ($language ? '_' . $language : '') . ($region? '_' . $region : '');

        if ($this->category) {
            //категория товара
            $this->params['breadcrumbs'][] = [
                'label' => $this->category->name,
                'url' => ('/category/' . $this->category->route),
            ];
            //получить в т.ч. по дочерним категориям
            $dataBaseData->innerJoin('cw_products_to_category pc', 'prod.id = pc.product_id')
                ->andWhere(['pc.category_id' => ProductsCategory::childsId($this->category->id)]);

            $cacheName .= '_category_' . $this->category->route;
        }




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

        $paginatePath = '/' . 'category'. ($this->category ? '/' . $this->category->route : '');

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
        return $this->render('product', [
            'product' => $product,
        ]);

    }


}
