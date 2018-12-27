<?php

namespace shop\modules\category\controllers;

use frontend\modules\favorites\models\UsersFavorites;
use yii\web\Controller;
use shop\modules\product\models\Product;
use shop\modules\category\models\ProductsCategory;
use frontend\modules\params\models\ProductParameters;
use frontend\modules\params\models\ProductParametersValues;
use frontend\modules\stores\models\Stores;
use frontend\components\Pagination;
use frontend\components\SdController;
use common\components\Help;
use yii;

class DefaultController extends SdController
{
    public $category = null;
    public $vendor = false;

    public function beforeAction($action)
    {
        if (isset(Yii::$app->params['catalog_category'])) {
            $this->category = Yii::$app->params['catalog_category'];
            Yii::$app->params['url_mask'] = 'category/*';
        }
        $path = explode('/', Yii::$app->request->pathInfo);
        if (count($path) > 1 && $path[0] =='vendor') {
            $this->vendor = true;
            Yii::$app->params['url_mask'] = 'vendor';
        }
        return parent::beforeAction($action);
    }


    public function actionIndex()
    {
        $request = Yii::$app->request;
        $vendorRequest = $request->get('vendor');

        $vendors = Product::conditionValues('vendor', 'distinct', $this->category);
        $vendorValidator = new \yii\validators\RangeValidator([
            'range' => array_column($vendors, 'vendor'),
            'allowArray' => true
        ]);
        if (!empty($vendorRequest) && !$vendorValidator->validate($vendorRequest)) {
            throw new \yii\web\NotFoundHttpException;
        };

        $stores = Product::usedStores(['category' => $this->category, 'vendor' => $this->vendor ? $vendorRequest : false]);

        $page = $request->get('page');
        $limit = $request->get('limit');
        $sort_request = $request->get('sort');
        $priceStart = $request->get('price-start');
        $priceEnd = $request->get('price-end');

        $storeRequest = $request->get('store');

        $sortvars = Product::sortvars();
        $defaultSort = Product::$defaultSort;

        $validator = new \yii\validators\NumberValidator();
        $validatorIn = new \yii\validators\RangeValidator(['range' => array_keys($sortvars)]);

        $storeValidator = new \yii\validators\RangeValidator([
            'range' => array_column($stores, 'uid'),
            'allowArray' => true
        ]);
        if (!empty($limit) && !$validator->validate($limit) ||
            !empty($page) && !$validator->validate($page) ||
            !empty($sort_request) && !$validatorIn->validate($sort_request) ||
            !empty($priceStart) && !$validator->validate($priceStart) ||
            !empty($priceEnd) && !$validator->validate($priceEnd) ||
            !empty($storeRequest) && !$storeValidator->validate($storeRequest)
        ) {
            throw new \yii\web\NotFoundHttpException;
        };

        if (!empty($sort_request)) {
            $sort = isset($sortvars[$sort_request]['name']) ? $sortvars[$sort_request]['name'] : $sort_request;
        } else {
            $sort = Product::$defaultSort;
        }

        $limit = (!empty($limit)) ? $limit : Product::$defaultLimit;
        $order = !empty($sortvars[$sort_request]['order']) ? $sortvars[$sort_request]['order'] : SORT_DESC;

        $this->params['breadcrumbs'][] = ['label' => Yii::t('shop', 'category_product'), 'url' => Help::href('/category')];
        if ($this->vendor) {
            //$this->params['breadcrumbs'][] = ['label' => $vendorRequest, 'url' => Help::href('/vendor/'.str_replace('', '_', $vendorRequest))];
            $this->params['breadcrumbs'][] = ['label' => $vendorRequest, 'url' => Help::href('/vendor/'.$vendorRequest)];
        }

        $storesData = [];
        $dataBaseData = Product::find()
            ->from(Product::tableName() . ' prod')
            ->innerJoin(Stores::tableName(). ' s', 's.uid = prod.store_id')
            ->where(['prod.available' => [Product::PRODUCT_AVAILABLE_YES, Product::PRODUCT_AVAILABLE_REQUEST]])
            ->select(['prod.*', 'prod.currency as product_currency','s.name as store_name', 's.route as store_route',
                's.displayed_cashback as displayed_cashback', 's.action_id as action_id', 's.uid as store_id',
                's.is_active as store_active',
                's.currency as currency', 's.action_end_date as action_end_date',
                'if (prod.old_price, (prod.old_price - prod.price)/prod.old_price, 0) as discount'])
            ->orderBy([$sort => $order]);
        $language = Yii::$app->language  == Yii::$app->params['base_lang'] ? false : Yii::$app->language;
        $region = Yii::$app->params['region']  == 'default' ? false : Yii::$app->params['region'];
        $cacheName = 'catalog_product_' . $page . '_' . $limit . '_' . $sort . '_' . $order .
            ($language ? '_' . $language : '') . ($region? '_' . $region : '');

        $filter = [];
        $f_res = Product::conditionValues(
            'price',
            ['min','max'],
            ['category' => $this->category, 'vendor' => $this->vendor ? $vendorRequest : false]
        );
        $filterPriceEndMax = (int)$f_res['max_price'];
        $filterPriceStartMin=(int)$f_res['min_price'];

        $paginateParams = [
            'limit' => $limit,
            'sort' => $sort,
            'page' => $page,
        ];
        if ($priceStart) {
            $filter[] = ['>=', 'price', $priceStart];
            $paginateParams['price-start'] = $priceStart;
        }
        if ($priceEnd) {
            $filter[] = ['<=', 'price', $priceEnd];
            $paginateParams['price-end'] = $priceEnd;
        }
        if ($vendorRequest) {
            $filter[] = ['vendor' => $vendorRequest];
            $paginateParams['vendor'] = $vendorRequest;
        }
        if ($storeRequest) {
            $filter[] = ['store_id' => $storeRequest];
            $paginateParams['store'] = $storeRequest;

        }
        if (!empty($filter)) {
            $dataBaseData->andWhere(array_merge(['and'], $filter));
            $cacheName .= ('_' . Help::multiImplode('_', $filter));
        }
        //ddd($dataBaseData);
        $paginatePath = '/' . ($this->vendor ? 'vendor/'.$vendorRequest : 'category');

        if ($this->category) {
            //есть категория
            $parents = $this->category->parentTree();
            foreach ($parents as $parent) {
                $paginatePath .= '/'.$parent['route'];
                $this->params['breadcrumbs'][] = [
                    'label' => $parent['name'],
                    'url' => Help::href($paginatePath),
                ];
            }
            //получить в т.ч. по дочерним категориям
            $dataBaseData->innerJoin('cw_products_to_category pc', 'prod.id = pc.product_id')
                ->andWhere(['pc.category_id' => $this->category->childCategoriesId()]);

            $cacheName .= '_category_' . $this->category->route;

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
        //$storeData['filter'] = $filters;
        //ddd($cacheName);

        $pagination = new Pagination(
            $dataBaseData,
            $cacheName,
            ['limit' => $limit, 'page' => $page, 'asArray'=> true]
        );

        $storesData['category'] = $this->category;
        $storesData['products'] = $pagination->data();
        $storesData["total_v"] = $pagination->count();
        $storesData["total_all_product"] = Product::activeCount();
        $storesData["page"] = empty($page) ? 1 : $page;
        $storesData["show_products"] = count($storesData['products']);
        $storesData["offset_products"] = $pagination->offset();
        $storesData["limit"] = empty($limit) ? Product::$defaultLimit : $limit;

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

        $storesData['favorites_ids'] = UsersFavorites::getUserFav(8, true);
        $storesData['filter'] = [
            'price_start' => $filterPriceStartMin,
            'price_end' => $filterPriceEndMax,
            'price_start_user' => $priceStart ? $priceStart : $filterPriceStartMin,
            'price_end_user' => $priceEnd ? $priceEnd : $filterPriceEndMax,
            'vendors' => $this->vendor ? false : $vendors,
            'vendors_user' => $vendorRequest ? $vendorRequest : false,
            'stores' => $stores,
            'store_user' => $storeRequest ? $storeRequest : [],
        ];
        $storesData['vendor'] = $this->vendor ?  $vendorRequest : false;
        return $this->render('index', $storesData);
    }

    public function actionProduct($id)
    {
        $product = Product::findOne($id);
        if (!$product) {
            throw new yii\web\NotFoundHttpException();
        }
        Yii::$app->params['url_mask'] = 'category/product/*';
        $path = '/category';
        $this->params['breadcrumbs'][] = ['label' => Yii::t('shop', 'category_product'), 'url' => Help::href('/category')];
        $parents = isset($product->categories[0]) ? $product->categories[0]->parentTree() : [];
        foreach ($parents as $parent) {
            $path .= '/'.$parent['route'];
            $this->params['breadcrumbs'][] = [
                'label' => $parent['name'],
                'url' => Help::href($path),
            ];
        }
        $this->breadcrumbs_last_item_disable = false;

        //продукты того же производителя
        $brandsProducts = Product::top([
            'where' =>  ['and', ['vendor' => $product->vendor], ['<>', 'p.id', $product->id]],
            'count' => 8
        ]);
        //продукты той же категории
        $categoryProducts = !empty($product->categories) ?
            Product::top([
                'category_id' => $product->categories[0]->id,
                'count' => 8,
                'where' => ['<>', 'p.id', $product->id],
            ]) : [];
        //похожие - той же категории и того же шопа
        $similarProducts = count($categoryProducts) && $product->store_id ?
            Product::top([
                'where' => ['and', ['store_id' => $product->store_id],['<>', 'p.id', $product->id]],
                'category_id' => $product->categories[0]->id,
                'count' => 8
            ]) : [];

        return $this->render('product', [
            'product' => $product,
            'favorites_ids' => UsersFavorites::getUserFav(8, true),
            'brands_products' => $brandsProducts,
            'category_products' => $categoryProducts,
            'similar_products' => $similarProducts,
            'category' => !empty($product->categories) ? $product->categories[0] : false,
        ]);
    }


}
