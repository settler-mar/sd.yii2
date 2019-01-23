<?php

namespace frontend\modules\shop\controllers;

use frontend\modules\favorites\models\UsersFavorites;
use yii\web\Controller;
use frontend\modules\product\models\Product;
use frontend\modules\vendor\models\Vendor;
use frontend\modules\product\models\ProductsCategory;
use frontend\modules\params\models\ProductParameters;
use frontend\modules\params\models\ProductParametersValues;
use frontend\modules\stores\models\Stores;
use frontend\components\Pagination;
use frontend\components\SdController;
use common\components\Help;
use frontend\modules\transitions\models\UsersVisits;
use yii;

class DefaultController extends SdController
{
    public $category = null;
    public $product = null;

    public function createAction($id)
    {
        $request = \Yii::$app->request;
        Yii::$app->params['url_mask'] = 'category';
        $path = explode('/', $request->pathInfo);
        if (count($path) > 1 && $path[0] =='shop') {
            $category = ProductsCategory::byRoute(array_slice($path, 1));
            //нашли категорию
            if ($category) {
                $this->category = $category;
                Yii::$app->params['url_mask'] = 'category/*';
                echo $this->actionIndex();
                exit;
            } else if (count($path) == 3 and $path[1] = 'product' and preg_match('/^\d+$/', $path[2])) {
                $product = Product::findOne($path[2]);
                if (!$product) {
                    throw new yii\web\NotFoundHttpException();
                }
                $this->product = $product;
                Yii::$app->params['url_mask'] = 'category/product/*';
                echo $this->actionProduct();
            }
        }
        return parent::createAction($id);
    }

    public function actionIndex()
    {
        $request = Yii::$app->request;
        $vendorRequest = $request->get('vendor');
        $storeRequest = $request->get('store_id');

        $query =  isset(Yii::$app->params['search_query']) ? Yii::$app->params['search_query'] : false;//поиск

        if ($vendorRequest) {
            $vendorDb = array_column(Vendor::items([
                'where' => ['v.route' => $vendorRequest], 'category' => $this->category ? $this->category->id : false
            ]), 'id');
            if (empty($vendorDb)) {
                throw new \yii\web\NotFoundHttpException;
            }
        }
        $storesUsed = Product::usedStores([
            'category' => $this->category,
        ]);

        $page = $request->get('page');
        $limit = $request->get('limit');
        $sort_request = $request->get('sort');
        $priceStart = $request->get('price-start');
        $priceEnd = $request->get('price-end');
        $priceStartMin = $request->get('price-start-min');
        $priceEndMax = $request->get('price-end-max');
        $priceStart = $priceStart == $priceStartMin ? false : $priceStart;
        $priceEnd = $priceEnd == $priceEndMax ? false : $priceEnd;


        $sortvars = Product::sortvars();
        $defaultSort = Product::$defaultSort;

        $validator = new \yii\validators\NumberValidator();
        $validatorIn = new \yii\validators\RangeValidator(['range' => array_keys($sortvars)]);
        $storeValidator = new \yii\validators\RangeValidator([
            'range' => array_column($storesUsed, 'uid'),
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
            $sortDb = isset($sortvars[$sort_request]['name']) ? $sortvars[$sort_request]['name'] : $sort_request;
            $sort = $sort_request;
        } else {
            $sortDb = $sort = Product::$defaultSort;
        }

        $limit = (!empty($limit)) ? $limit : Product::$defaultLimit;
        $order = !empty($sortvars[$sort]['order']) ? $sortvars[$sort]['order'] : SORT_DESC;

        $this->params['breadcrumbs'][] = ['label' => Yii::t('shop', 'category_product'), 'url' => Help::href('/shop')];

        $storesData = [];
        $dataBaseData = Product::items()->orderBy([$sortDb => $order]);

        $language = Yii::$app->language  == Yii::$app->params['base_lang'] ? false : Yii::$app->language;
        $region = Yii::$app->params['region']  == 'default' ? false : Yii::$app->params['region'];
        $cacheName = 'catalog_product_' . $page . '_' . $limit . '_' . $sortDb . '_' . $order .
            ($language ? '_' . $language : '') . ($region? '_' . $region : '') . ($query ? '_query_'.$query : '');

        $filter = [];
        $where = [];
        if (!empty($vendorDb)) {
            $where['vendor_id'] = $vendorDb;
        }
        if (isset($storeRequest)) {
            $where['store_id'] = $storeRequest;
        }
        $pricesResult = Product::conditionValues(
            'price',
            ['min','max'],
            [
                'category' => $this->category,
                'where' => $where,
            ]
        );
        $filterPriceEndMax = (int)$pricesResult['max_price'];
        $filterPriceStartMin=(int)$pricesResult['min_price'];

        $paginateParams = [
            'limit' => $limit,
            'sort' => $sort,
            'page' => $page,
            'query' => $query ? $query : null,
        ];
        if ($priceStart && $priceStart != $filterPriceStartMin) {
            $filter[] = ['>=', 'price', $priceStart];
            $paginateParams['price-start'] = $priceStart;
        }
        if ($priceEnd && $priceEnd != $filterPriceEndMax) {
            $priceEnd = $priceEnd<$priceStart ? $priceStart : $priceEnd;
            $filter[] = ['<=', 'price', $priceEnd];
            $paginateParams['price-end'] = $priceEnd;
        }
        if ($vendorRequest && !empty($vendorDb)) {
            $filter[] = ['vendor_id' => $vendorDb];
            $paginateParams['vendor'] = $vendorRequest;
        }
        if ($storeRequest) {
            $filter[] = ['store_id' => $storeRequest];
            $paginateParams['store_id'] = $storeRequest;

        }
        if (!empty($filter)) {
            $dataBaseData->andWhere(array_merge(['and'], $filter));
            $cacheName .= ('_' . Help::multiImplode('_', $filter));
        }
        $paginatePath = '/shop';

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
        if ($query) {
            $sql = 'SELECT * FROM products WHERE match(\'' . $query . '\') LIMIT ' . $limit;
            $ids = array_column(Yii::$app->sphinx->createCommand($sql)->queryAll(), 'id');

            $dataBaseData->andWhere(['prod.id' => $ids]);
            $paginatePath = '/search/product';
            $this->params['breadcrumbs'][] = [
                'label' => Yii::t('main', 'breadcrumbs_search'),
                'url' => Help::href($paginatePath.'?limit=1000&query='.$query),
            ];
            Yii::$app->params['url_mask'] = 'category/search';
        }
        if (!empty($filter)) {
            $this->params['breadcrumbs'][] = [
                'label' => Yii::t('shop', 'filter_result'),
                'url' => Help::href($paginatePath . '&' . http_build_query($paginateParams)),
            ];
            Yii::$app->params['url_mask'] = 'category/filter';
        }
        $pagination = new Pagination(
            $dataBaseData,
            $cacheName,
            ['limit' => $query ? 48 : $limit, 'page' => $page, 'asArray'=> true]
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

        $storesData['favorites_ids'] = UsersFavorites::getUserFav(Yii::$app->user->id, true);

        $vendors =  Vendor::items([
            'limit' => 20,
            'sort'=>'v.name',
            'database' => $dataBaseData,
        ]);

        $stores = Product::usedStores([
            'database' => $dataBaseData
        ]);

        $filterPriceEndMax = $filterPriceStartMin == $filterPriceEndMax ? $filterPriceEndMax + 1 : $filterPriceEndMax;
        $storesData['filter'] = [
            'price_start' => $filterPriceStartMin,
            'price_end' => $filterPriceEndMax,
            'price_start_user' => $priceStart && $priceStart > $filterPriceStartMin ? $priceStart : $filterPriceStartMin,
            'price_end_user' => $priceEnd && ($priceEnd < $filterPriceEndMax || $filterPriceEndMax ==0) ? $priceEnd : $filterPriceEndMax,
            'vendors' => $vendors,
            'vendors_user' => $vendorRequest ? $vendorRequest : false,
            'stores' => $stores,
            'store_user' => $storeRequest ? $storeRequest : [],
            'query' => $query ? $query : false,
            'action' => Yii::$app->help->href($paginatePath),//чтобы не попал page
            'limit' => $query ? $limit : false,
        ];
        return $this->render('index', $storesData);
    }

    public function actionProduct()
    {
        $product = $this->product;//Product::findOne($id);
        $path = '/shop';
        $this->params['breadcrumbs'][] = ['label' => Yii::t('shop', 'category_product'), 'url' => Help::href('/shop')];
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
        $brandsProducts = $product->vendor_id ? Product::top([
            'where' =>  ['and', ['vendor_id' => $product->vendor_id], ['<>', 'prod.id', $product->id]],
            'count' => 8
        ]) : [];
        //продукты той же категории другие бренды
        $categoryProducts = !empty($product->categories) ?
            Product::top([
                'category_id' => $product->categories[0]->id,
                'count' => 8,
                'multi_brands' => true,
                'with_image' => true,
                'where' => ['and', ['<>', 'prod.id', $product->id], ['<>', 'vendor_id', $product->vendor_id]],
            ]) : [];
        //похожие - той же категории и того же шопа
        $similarProducts = $product->store_id ?
            Product::top([
                'where' => ['and', ['store_id' => $product->store_id],['<>', 'prod.id', $product->id]],
                'multi_brands' => true,
                'category_id' => $product->categories[0]->id,
                'with_image' => true,
                'count' => 8
            ]) : [];

        //просмотренные товары
        $user_id = 8;//Yii::$app->user->id;
        if ($user_id > 0) {
            $visits = Product::top([
                'user_transition' => $user_id,
                'sort' => 'uv.visit_date',
                'order' => SORT_DESC,
                'where' => ['>', 'visit_date', date('Y-m-d H:i:s', time() - 7 * 24 * 60 * 60)]
            ]);
        }

        return $this->render('product', [
            'product' => $product,
            'favorites_ids' => UsersFavorites::getUserFav(8, true),
            'brands_products' => $brandsProducts,
            'category_products' => $categoryProducts,
            'similar_products' => $similarProducts,
            'category' => !empty($product->categories) ? $product->categories[0] : false,
            'visiteds' => !empty($visits) ? $visits : [],
        ]);
    }
}
