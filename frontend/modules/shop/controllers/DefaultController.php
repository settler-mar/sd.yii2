<?php

namespace frontend\modules\shop\controllers;

use frontend\modules\favorites\models\UsersFavorites;
use yii\web\Controller;
use frontend\modules\product\models\Product;
use frontend\modules\vendor\models\Vendor;
use frontend\modules\product\models\ProductsCategory;
use frontend\modules\params\models\ProductParameters;
use frontend\modules\params\models\ProductParametersValues;
use frontend\modules\slider\models\Slider;
use frontend\components\Pagination;
use frontend\components\SdController;
use common\components\Help;
use frontend\modules\transitions\models\UsersVisits;
use frontend\modules\sdblog\models\Posts;
use frontend\modules\stores\models\Stores;
use frontend\modules\reviews\models\Reviews;
use yii;

class DefaultController extends SdController
{
    public $category = null;
    public $product = null;

    public function createAction($id)
    {
        $this->params['disable_breadcrumbs_home_link'] = 1;//для виджета крошек
        $request = \Yii::$app->request;
        Yii::$app->params['url_mask'] = 'shop';
        $path = explode('/', $request->pathInfo);
        if ($request->get('page')) {
            $path = array_diff($path, ['page-'.$request->get('page')]);
        }
        if (count($path) > 1 && $path[0] =='shop') {
            $category = ProductsCategory::byRoute(array_slice($path, 1));
            //нашли категорию
            if ($category) {
                $this->category = $category;
                Yii::$app->params['url_mask'] = 'shop/*';
                echo $this->actionCategory();
                exit;
            } else if (count($path) == 3 and $path[1] = 'product' and preg_match('/^\d+$/', $path[2])) {
                $product = Product::findOne($path[2]);
                if (!$product) {
                    throw new yii\web\NotFoundHttpException();
                }
                $this->product = $product;
                Yii::$app->params['url_mask'] = 'shop/product/*';
                echo $this->actionProduct();
                exit;
            }
        }
        return parent::createAction($id);
    }

    public function actionIndex()
    {
        $data = [];
        $data['slider_products'] = Slider::get(['place'=>'product']);
        $data['category_top'] = ProductsCategory::top([
            'count' => 12,
            'order' => ['logo' => SORT_DESC, 'in_top' => SORT_DESC, 'count' => SORT_DESC],
        ]);
        $data['products_top'] = Product::top(['by_visit' => 1, 'limit' => 12]);
        $data['products_top_count'] = Product::top(['by_visit' => 1, 'count' => 1]);
        $data["total_v"] = Product::find()->count();
        if (Yii::$app->language == 'ru-RU') {
            $data['posts'] = Posts::getLastPosts();
            $data['posts_count'] = Posts::find()->count();
        }
        $data['stores'] = Stores::top12(25);
        $data['stores_count'] = Stores::activeCount();
        $data['most_profitable'] = Product::top([
            'limit' => 8,
            'by_category' => true,//по одной в категории
            'sort' => 'discount',
            'order' => SORT_DESC,
        ]);
        $data['most_profitable_count'] = Product::top(['having' => ['>', 'discount', 0.5], 'count' => 1]);
        $data['brands'] = Vendor::items([
            'limit' => 25,
        ]);
        $data['brands_count'] = Vendor::items([
            'count' => true
        ]);
        $data['visited'] = Product::viewedByUser(Yii::$app->user->id, false);
        $data['visited_count'] = Product::viewedByUser(Yii::$app->user->id, false, true);
        $data['top_reviews'] = Reviews::top();
        $data['reviews_count'] = Reviews::find()->count();

        return $this->render('index', $data);
    }

    public function actionCategory()
    {
        $request = Yii::$app->request;
        $vendorRequest = $request->get('vendor');
        $storeRequest = $request->get('store_id');

        $query =  isset(Yii::$app->params['search_query']) ? Yii::$app->params['search_query'] : false;//поиск
        $month =  isset(Yii::$app->params['search_month']) ? Yii::$app->params['search_month'] : false;//товары месяца
        $profit =  isset(Yii::$app->params['search_profit']) ? Yii::$app->params['search_profit'] : false;//товары со скидкой

        if ($vendorRequest) {
            $vendorDb = array_column(Vendor::items([
                'where' => ['route' => $vendorRequest], 'category' => $this->category ? $this->category->childCategoriesId() : false
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
            ($language ? '_' . $language : '') . ($region? '_' . $region : '') . ($query ? '_query_'.$query : '') .
            ($month ? '_month_' : '').($profit ? '_profit_' : '') . ($vendorRequest ? ' _vendor_' . $vendorRequest : '');

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
            'module' => $query || $month || $profit ? 'product' : null,
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
        if ($month) {
            $visits = UsersVisits::find()
                ->select(['product_id', 'count(*) as count'])
                ->where(['and', ['>', 'product_id', 0], ['>', 'visit_date', time() - 3600 * 24 * 30]])
                ->groupBy(['product_id']);
            $dataBaseData->innerJoin(['visits' => $visits], 'visits.product_id = prod.id');
            $paginateParams['month'] = 1;
        }
        if ($profit) {
            $dataBaseData->having(['>', 'discount', 0.5]);
            $paginateParams['profit'] = 1;
        }
        if ($storeRequest) {
            $filter[] = ['store_id' => $storeRequest];
            $paginateParams['store_id'] = $storeRequest;

        }
        if (!empty($filter)) {
            $dataBaseData->andWhere(array_merge(['and'], $filter));
            $cacheName .= ('_' . Help::multiImplode('_', $filter));
        }
        $paginatePath = $query || $month || $profit ? '/search/product' : '/shop';

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
                'url' => Help::href($paginatePath.'?module=product&limit=1000&query='.$query),
            ];
            Yii::$app->params['url_mask'] = 'shop/search';
        }
        if ($month) {
            $this->params['breadcrumbs'][] = [
                'label' => Yii::t('shop', 'breadcrumbs_produtct_hits_in').' '.
                    Yii::t('common', 'month_in_'.date('m')),
                'url' => Help::href($paginatePath . '?module=product&month=1'),
            ];
            //Yii::$app->params['url_mask'] = 'shop/filter';todo
        }
        if ($profit) {
            $this->params['breadcrumbs'][] = [
                'label' => Yii::t('shop', 'breadcrumbs_produtct_with_profit'),
                'url' => Help::href($paginatePath . '?module=product&profit=1'),
            ];
            //Yii::$app->params['url_mask'] = 'shop/filter';todo
        }
        if (!empty($filter)) {
            $this->params['breadcrumbs'][] = [
                'label' => Yii::t('shop', 'filter_result'),
                'url' => Help::href($paginatePath . '?' . http_build_query($paginateParams)),
            ];
            Yii::$app->params['url_mask'] = 'shop/filter';
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
            'sort'=>['priority'=>SORT_ASC, 'name'=>SORT_ASC],
            'database' => $dataBaseData,
        ]);

        $stores = Product::usedStores([
            'sort'=>['priority'=>SORT_ASC, 'name'=>SORT_ASC],
            'database' => $dataBaseData
        ]);

        $filterPriceEndMax = $filterPriceStartMin == $filterPriceEndMax ? $filterPriceEndMax + 1 : $filterPriceEndMax;
        $storesData['filter'] = [
            'price_start' => $filterPriceStartMin,
            'price_end' => $filterPriceEndMax,
            'price_start_user' => $priceStart && $priceStart > $filterPriceStartMin ? $priceStart : $filterPriceStartMin,
            'price_end_user' => $priceEnd && ($priceEnd < $filterPriceEndMax || $filterPriceEndMax ==0) ? $priceEnd : $filterPriceEndMax,
            'vendors' => $vendors,
            //'vendors_json' => json_encode($vendors),
            'vendors_user' => $vendorRequest ? $vendorRequest : false,
            'stores' => $stores,
            'store_user' => $storeRequest ? $storeRequest : [],
            'query' => $query ? $query : false,
            'action' => Yii::$app->help->href($paginatePath),//чтобы не попал page
            'limit' => $query ? $limit : false,
            'month' => $month,
            'profit' => $profit,
        ];
        return $this->render('category', $storesData);
    }

    public function actionProduct()
    {
        $product = $this->product;//Product::findOne($id);
        $path = '/shop';
        $this->params['breadcrumbs'][] = ['label' => Yii::t('shop', 'category_product'), 'url' => Help::href('/shop')];
        $this->breadcrumbs_last_item_disable = false;
        $category = isset($product->categories[0]) ? $product->categories[0] : false;//
        $categoryRoute = $category ? $category->parentTree(1) : false;//только если категория активна, иначе нет
        $category = $category && !empty($categoryRoute) ? $category : false;
        if ($category) {
            $parents = $category->parentTree();
            foreach ($parents as $parent) {
                $path .= '/'.$parent['route'];
                $this->params['breadcrumbs'][] = [
                    'label' => $parent['name'],
                    'url' => Help::href($path),
                ];
            }
        }

        //продукты того же производителя
        $brandsProducts = $product->vendor_id ? Product::top([
            'where' =>  ['and', ['vendor_id' => $product->vendor_id], ['<>', 'prod.id', $product->id]],
            'limit' => 8
        ]) : [];
        //продукты той же категории другие бренды
        $categoryProducts = $category ?
            Product::top([
                'category_id' => $product->categories[0]->id,
                'limit' => 8,
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
                'limit' => 8
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
            'category' => $category,
            'category_route' => $categoryRoute,
            'visiteds' => !empty($visits) ? $visits : [],
        ]);
    }
}
