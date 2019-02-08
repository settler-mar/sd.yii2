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
use frontend\modules\coupons\models\Coupons;
use frontend\modules\meta\models\Meta;
use yii;

class DefaultController extends SdController
{
    private $category = null;
    private $product = null;
    private $store = null;


    //private $requestData = [];
    //private $cacheName = '';
    private $paginatePath = '';
    //private $paginateParams = [];

    public function createAction($id)
    {
        $this->params['disable_breadcrumbs_home_link'] = 1;//для виджета крошек
        $request = \Yii::$app->request;
        Yii::$app->params['url_mask'] = 'shop';
        $path = explode('/', $request->pathInfo);
        $this->paginatePath = '/'. $request->pathInfo;
        if ($request->get('page')) {
            $path = array_diff($path, ['page-'.$request->get('page')]);
        }
        if (count($path) > 1 && $path[0] =='shop') {
            $category = ProductsCategory::byRoute(array_slice($path, 1));
            //нашли категорию
            if ($category) {
                $this->category = $category;
                //Yii::$app->params['url_mask'] = 'shop/*';
                if ($request->isAjax) {
                    //данные айаксом
                    echo $this->actionData();
                    exit;
                }
                echo $this->actionCategory();
                exit;
            }
            $storesUsed = Product::usedStores([
                'where' => ['s.route' => $path[1], 's.is_active'=> [0, 1]],
            ]);
            $store = count($storesUsed) ? Stores::byId($storesUsed[0]['uid']) : false;
            //нашли шоп по пути
            if ($store) {
                $this->store = $store;
                //Yii::$app->params['url_mask'] = 'shop/store/*';
                if ($request->isAjax) {
                    //данные айаксом
                    echo $this->actionData();
                    exit;
                }
                echo $this->actionCategory();
                exit;
            }
            if (count($path) == 3 and $path[1] = 'product' and preg_match('/^\d+$/', $path[2])) {
                $product = Product::findOne($path[2]);
                if (!$product) {
                    throw new yii\web\NotFoundHttpException();
                }
                $this->product = $product;
                //Yii::$app->params['url_mask'] = 'shop/product/*';
                echo $this->actionProduct();
                exit;
            }
        }
        return parent::createAction($id);
    }

    public function actionIndex()
    {
        Yii::$app->params['url_mask'] = 'shop';
        $data = [];
        $data['slider_products'] = Slider::get(['place'=>'product']);
        $data['category_top'] = ProductsCategory::top([
            'count' => 12,
            'order' => ['in_top' => SORT_DESC, 'logo' => SORT_DESC],
            'empty' => true,
        ]);
        $data['products_top'] = Product::top(['by_visit' => 1, 'limit' => 12]);

        $data['products_top_count'] = Product::top(['by_visit' => 1, 'count' => 1]);
        $data["total_v"] = Product::find()->count();
        if (Yii::$app->language == 'ru-RU') {
            $data['posts'] = Posts::getLastPosts();
            $data['posts_count'] = Posts::find()->count();
        }
        $data['stores']= Product::usedStores(['limit' => 15]);
        $data['stores_count'] = Stores::activeCount();
        $data['most_profitable'] = Product::top([
            'limit' => 4,//todo нужно 8, но если результ меньше 8, то долгий запрос, уменьшил пока до 4
            'by_category' => true,//по одной в категории
            'sort' => 'discount',
            'order' => SORT_DESC,
        ]);
        $data['most_profitable_count'] = Product::top(['where' => ['>', 'discount', 50], 'count' => 1]);
        $data['brands'] = Vendor::items([
            'limit' => 20,
        ]);
        $data['brands_count'] = Vendor::items([
            'count' => true
        ]);
        $data['visited'] = Product::viewedByUser(Yii::$app->user->id, false);
        $data['visited_count'] = Product::viewedByUser(Yii::$app->user->id, false, true);
        $data['top_reviews'] = Reviews::top();
        $data['reviews_count'] = Reviews::find()->count();
        $data["favorites_ids"] = UsersFavorites::getUserFav(Yii::$app->user->id, true);

        return $this->render('index', $data);
    }

    public function actionCategory()
    {
        Yii::$app->params['url_mask'] = 'shop/*';//изначально для категории, потом может измениться при обработке запроса
        //для запросов получить параметры запроса
        //ddd($this->store);
        $requestData = self::getRequestData([
            'category' =>$this->category,
            'store_id'=> $this->store ? $this->store->uid : null,
            'url_mask' => $this->category ? 'shop/*' : 'shops/store/*',
            'path' => '/'.Yii::$app->request->pathInfo,
        ]);

        //$this->params['breadcrumbs'][] = ['label' => Yii::t('shop', 'category_product'), 'url' => Help::href('/shop')];

        $storesData = [];

        $storesData['category'] = $this->category;

        $storesData['store'] = $this->store;

        $storesData['sortlinks'] =
            $this->getSortLinks(
                $requestData['request_data']['path'],
                Product::sortvars(),
                Product::$defaultSort,
                $requestData['paginate_params']
            );

        $this->paginatePath = $requestData['request_data']['path'];

        //какие блоки обновляются по каким адресам
        $params = array_merge(Yii::$app->request->get(), $requestData['request_data']);

      // ddd($params);
        $params = http_build_query($params);
        //формируем новые гет-параметры
        $filterUrl = '/shop/filter' . ($params ? '?' . $params : '');
        $titleUrl = '/shop/title' . ($params ? '?' . $params : '');
        $storesData['requests'] = json_encode([
            ['blocks'=> ["catalog-products-content", "catalog-products-info"]],
            ['blocks' => ["catalog_products-filter"], 'url' => Yii::$app->help->href($filterUrl)],
            ['blocks' => ["catalog_products-title"], 'url' => Yii::$app->help->href($titleUrl)],
        ]);
        if ($requestData['request_data']['page']> 1) {
            $this->params['breadcrumbs'][] = Yii::t('main', 'breadcrumbs_page').' ' . $requestData['request_data']['page'];
        }
        return $this->render('category', $storesData);
    }

    public function actionProduct()
    {
        Yii::$app->params['url_mask'] = 'shop/product/*';
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
        //продукты той же категории другие бренды, желательно другие шопы, если шопов мало, то дополняем тем же шопом
        $categoryProducts = $category ?
            Product::top([
                'category_id' => $product->categories[0]->id,
                'limit' => 8,
                     //указываем конкретного вендора какие НЕ ВЫВОДИТЬ, шопы вначале разные, потом для дополнения без учёта шопа
                'other_brands_of' => ['product_id' =>$product->id, 'vendors_id' => [$product->vendor_id], 'stores_id' =>[]],
                'with_image' => true,
                'where' => ['and', ['<>', 'prod.id', $product->id]],
            ]) : [];
        //похожие - той же категории и того же шопа, разные бренды
        $similarProducts = $product->store_id ?
            Product::top([
                'where' => ['and', ['store_id' => $product->store_id],['<>', 'prod.id', $product->id]],
                    //указываем конкретный шоп какой ВЫВОДИТЬ, бренды сначала разные, потом для дополнения без учёта бренда
                'other_brands_of' => ['product_id' =>$product->id, 'stores_id' => [$product->store_id], 'vendors_id' => []],
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

        //купоны
        $coupons = $product->store_id ? Coupons::top(['store' => $product->store_id, 'limit' => 4]) : [];
        $favoritesIds = UsersFavorites::getUserFav(Yii::$app->user->id, true);

        return $this->render('product', [
            'product' => $product,
            'favorites_ids' => $favoritesIds,
            'brands_products' => $brandsProducts,
            'category_products' => $categoryProducts,
            'similar_products' => $similarProducts,
            'category' => $category,
            'category_route' => $categoryRoute,
            'visiteds' => !empty($visits) ? $visits : [],
            'coupons' => $coupons,
        ]);
    }

    /**
     * выдача данных товары
     * для получения из ajax
     */

    public function actionData()
    {
        //для запросов получить параметры запроса
        $requestData = self::getRequestData(['category' =>$this->category, 'store_id'=> $this->store]);
        //return json_encode([$requestData['query_db']->where,$requestData['query_db']->join ]);

        $pagination = new Pagination(
            $requestData['query_db'],
            $requestData['cache_name'],
            [
                'limit' => $requestData['request_data']['query'] ? 48 : $requestData['request_data']['limit'],
                'page' => $requestData['request_data']['page'],
                'asArray'=> true
            ]
        );
        //return json_encode([$requestData['query_db'], $requestData['request_data']]);

        //$storesData['category'] = $requestData['request_data']['category'];
        $storesData['products'] = $pagination->data();
        $storesData["total_v"] = $pagination->count();
        $storesData["total_all_product"] = Product::activeCount();
        $storesData["page"] = empty($requestData['request_data']['page']) ? 1 : $requestData['request_data']['page'];
        $storesData["show_products"] = count($storesData['products']);
        $storesData["offset_products"] = $pagination->offset();
        $storesData["limit"] = empty($limit) ? Product::$defaultLimit : $limit;

        if ($pagination->pages() > 1) {
            $storesData["pagination"] = $pagination->getPagination($this->paginatePath, $requestData['paginate_params']);
            //$this->makePaginationTags($paginatePath, $pagination->pages(), $page, $paginateParams);
        }

        $storesData['favorites_ids'] = UsersFavorites::getUserFav(Yii::$app->user->id, true);

        return $this->renderAjax('ajax/category', $storesData);
    }

    /**
     * выдача заголовка
     * @return string
     */
    public function actionTitle()
    {
        //для запросов получить параметры запроса
        $savedRequest = self::getRequestData();


        $pagination = new Pagination(
            $savedRequest['query_db'],
            $savedRequest['cache_name'],
            [
                'limit' => $savedRequest['request_data']['query'] ? 48 : $savedRequest['request_data']['limit'],
                'page' => $savedRequest['request_data']['page'],
                'asArray'=> true
            ]
        );

        //а..turn json_encode([$savedRequest]);



        $storesData['category'] = $savedRequest['category'];
        $storeData['store'] = isset($savedRequest['request_data']['store_id']) ?
            Stores::byId($savedRequest['request_data']['store_id']) : null;

        $storesData["total_v"] = $pagination->count();

        $meta = Meta::findByUrl(urldecode(urldecode($savedRequest['request_data']['url_mask'])));

        $storesData['h1'] =  $meta && isset($meta['h1']) ? $meta['h1'] : null;

        //Yii::$app->params['url_mask'] = urldecode(urldecode($savedRequest['request_data']['url_mask']));
        $file = file_get_contents(Yii::getAlias('@frontend/modules/shop/views/default/ajax/title.twig'));
        $str =  Yii::$app->TwigString->render($file, $storesData);
        return Yii::$app->TwigString->render($str, $storesData);
        //return $this->renderAjax('@frontend/modules/shop/views/default/ajax/title.twig', $storesData);
        //return json_encode([$savedRequest['request_data'], Yii::$app->request->get(), $str,  Yii::$app->params['url_mask']]);
    }


    /** выдача фильтра
     * @return string
     */
    public function actionFilter()
    {
        $savedRequest = self::getRequestData();

        $where = [];
        if (!empty($savedRequest['request_data']['vendor_db'])) {
            $where['vendor_id'] = $savedRequest['request_data']['vendor_db'];
        }
        if (isset($savedRequest['request_data']['store_request'])) {
            $where['store_id'] = $savedRequest['request_data']['store_request'];
        }

        $category = $savedRequest['category'];

        $pricesResult = Product::conditionValues(
            'price',
            ['min', 'max'],
            [
                'category' => $category,
                'where' => $where,
            ]
        );
        $filterPriceEndMax = (int)$pricesResult['max_price'];
        $filterPriceStartMin=(int)$pricesResult['min_price'];

        if ($savedRequest['request_data']['price_start'] && $savedRequest['request_data']['price_start'] != $filterPriceStartMin) {
            $filter[] = ['>=', 'price', $savedRequest['request_data']['price_start']];
        }

        if ($savedRequest['request_data']['price_end'] && $savedRequest['request_data']['price_end'] != $filterPriceEndMax) {
            $priceEnd = $savedRequest['request_data']['price_end'] < $savedRequest['request_data']['price_start'] ?
                $savedRequest['request_data']['price_start'] : $savedRequest['request_data']['price_end'];
            $filter[] = ['<=', 'price', $priceEnd];
        }


        $vendors =  Vendor::items([
            'sort'=>['priority'=>SORT_ASC, 'name'=>SORT_ASC],
            'database' => $savedRequest['query_db'],
        ]);


         $stores = !empty($savedRequest['request_data']['store_id']) ? [] : Product::usedStores([ //отключения фильтра, если задан шоп каталога (не в фильтре)
             'sort'=>['priority'=>SORT_ASC, 'name'=>SORT_ASC],
             'database' => $savedRequest['query_db']
         ]);
         //return json_encode([$stores, $savedRequest['request_data']['store_id'], $savedRequest['request_data']['store_request']]);

         $storesData['filter'] = [
             'price_start' => $filterPriceStartMin,
             'price_end' => $filterPriceEndMax,
             'price_start_user' => $savedRequest['request_data']['price_start'] && $savedRequest['request_data']['price_start'] > $filterPriceStartMin
                 ? $savedRequest['request_data']['price_start'] : $filterPriceStartMin,
             'price_end_user' => $savedRequest['request_data']['price_end'] &&
                ($savedRequest['request_data']['price_end'] < $filterPriceEndMax || $filterPriceEndMax == 0) ?
                 $savedRequest['request_data']['price_end'] : $filterPriceEndMax,
             'vendors' => $vendors,
             'vendors_user' => !empty($savedRequest['request_data']['vendor_request']) ? $savedRequest['request_data']['vendor_request'] : false,
             'stores' => $stores,
             'store_user' => isset($savedRequest['request_data']['store_request']) ? $savedRequest['request_data']['store_request'] : [],
             'query' => !empty($savedRequest['request_data']['query']) ?$savedRequest['request_data']['query'] : false,
             'action' => urldecode(urldecode($savedRequest['request_data']['path'])),
             'limit' => !empty($savedRequest['request_data']['query']) ? $savedRequest['request_data']['limit'] : false,
             'month' => !empty($savedRequest['request_data']['month']) ? $savedRequest['request_data']['month'] : false,
             'profit' => !empty($savedRequest['request_data']['profit']) ? $savedRequest['request_data']['profit'] : false,
         ];

         return $this->renderAjax('ajax/filter.twig', $storesData);
    }

    //формируем данные запроса
    public static function getRequestData($params = [])
    {
        $request = Yii::$app->request;
        $category = isset($params['category']) ? $params['category'] : null;
        $category = $category ? $category :
            ($request->get('category_id') ? ProductsCategory::byId($request->get('category_id')) : null);

        $vendorRequest = $request->get('vendor');
        if (isset($params['store_id'])) {
            //шоп из роут
            $storeRequest = $params['store_id'];
        } else {
            //из гет может быть в 2 вариантах
            $storeRequest = $request->get('store_id') ? $request->get('store_id')
                : ($request->get('store_request') ? $request->get('store_request') : null) ;
        }

        $query =  isset(Yii::$app->params['search_query']) ? Yii::$app->params['search_query'] : false;//поиск
        $month =  isset(Yii::$app->params['search_month']) ? Yii::$app->params['search_month'] : false;//товары месяца
        $profit =  isset(Yii::$app->params['search_profit']) ? Yii::$app->params['search_profit'] : false;//товары со скидкой

        if (isset($params['vendor_id'])) {
            $vendorDb = [$params['vendor_id']];
        } else {
            if ($vendorRequest) {
                $vendorDb = array_column(Vendor::items([
                    'where' => ['route' => $vendorRequest], 'category' => $category ? $category->childCategoriesId() : false
                ]), 'id');
                if (empty($vendorDb)) {
                    throw new \yii\web\NotFoundHttpException;
                }
            }
        }
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

        $validator = new \yii\validators\NumberValidator();
        $validatorIn = new \yii\validators\RangeValidator(['range' => array_keys($sortvars)]);

        if (!empty($limit) && !$validator->validate($limit) ||
            !empty($page) && !$validator->validate($page) ||
            !empty($sort_request) && !$validatorIn->validate($sort_request) ||
            !empty($priceStart) && !$validator->validate($priceStart) ||
            !empty($priceEnd) && !$validator->validate($priceEnd)
            // || !empty($storeRequest) && !$storeValidator->validate($storeRequest)
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

        $priceStart = $request->get('price-start');
        $priceStart = $priceStart == $priceStartMin ? false : $priceStart;
        $priceEnd = $request->get('price-end');
        $priceEnd = $priceEnd == $priceEndMax ? false : $priceEnd;

        $requestData = [
            'limit' => $limit,
            'order' => $order,
            'sort_db' => $sortDb,
            'page' => $page,
            'sort_request' => $sort_request,
            'price_start_min' => $priceStartMin,
            'price_end_max' => $priceEndMax,
            'price_start' => $priceStart == $priceStartMin ? false : $priceStart,
            'price_end' => $priceEnd == $priceEndMax ? false : $priceEnd,
            'query' => $query,
            'month' => $month,
            'profit' => $profit,
            'store_id' => isset($params['store_id']) ? $params['store_id'] : null, //из роуг
            'store_request' => $storeRequest,//для поиски - или из гет или из роут
            'vendor_request' => $vendorRequest,
            'vendor_db' => isset($vendorDb) ? $vendorDb : null,
            'sort' => $sort,
            'category_id' => isset($params['category']) ? $params['category']->id : null,
            'category_request' => $category ? $category->id : null,
            'url_mask' => urlencode($request->get('url_mask') ? $request->get('url_mask') :
                (isset($params['url_mask']) ? $params['url_mask'] : '/' . $request->pathInfo)
            ),
            'path' => urlencode($request->get('path') ? $request->get('path') :
                (isset($params['path']) ? $params['path'] : '/' . $request->pathInfo)
            ),


        ];
        $language = Yii::$app->params['url_prefix'];// Yii::$app->language  == Yii::$app->params['base_lang'] ? false : Yii::$app->language;
        $region = Yii::$app->params['region']  == 'default' ? false : Yii::$app->params['region'];
        $cacheName = 'catalog_product_' . $page . '_' . $limit . '_' . $sortDb . '_' . $order .
            ($language ? '_' . $language : '') . ($region? '_' . $region : '') . ($query ? '_query_'.$query : '') .
            ($month ? '_month_' : '').($profit ? '_profit_' : '') .
            ($vendorRequest ? ' _vendor_' . Help::multiImplode('_', $vendorRequest) : '');
        if (isset($params['category'])) {
            $cacheName .= '_category_' . $params['category']->route;
        }
        $paginateParams = [
           'limit' => $limit,
           'sort' => $sort,
           'page' => $page,
        ];

        //готовим данные запроса
        $querydb = Product::items()->orderBy([$requestData['sort_db'] => $requestData['order']]);

        $filter = [];
        $where = [];
        if (!empty($requestData['vendor_db'])) {
            $where['vendor_id'] = $requestData['vendor_db'];
        }
        if (isset($requestData['store_request'])) {
            $where['store_id'] = $requestData['store_request'];
        }
        $pricesResult = Product::conditionValues(
            'price',
            ['min','max'],
            [
                'category' => $category,
                'where' => $where,
            ]
        );
        $filterPriceEndMax = (int)$pricesResult['max_price'];
        $filterPriceStartMin=(int)$pricesResult['min_price'];

        if ($requestData['price_start'] && $requestData['price_start'] != $filterPriceStartMin) {
            $filter[] = ['>=', 'price', $requestData['price_start']];
            $paginateParams['price-start'] = $requestData['price_start'];
        }
        if ($requestData['price_end'] && $requestData['price_end'] != $filterPriceEndMax) {
            $priceEnd = $requestData['price_end'] < $requestData['price_start'] ?
                $requestData['price_start'] : $requestData['price_end'];
            $filter[] = ['<=', 'price', $priceEnd];
            $paginateParams['price-end'] = $priceEnd;
        }
        //if (isset($requestData['vendor_request']) && !empty($requestData['vendor_db'])) {
        if (!empty($requestData['vendor_db'])) {
            $filter[] = ['vendor_id' => $requestData['vendor_db']];
        }
        if (!empty($requestData['month'])) {
            $visits = UsersVisits::find()
                ->select(['product_id', 'count(*) as count'])
                ->where(['and', ['>', 'product_id', 0], ['>', 'visit_date', time() - 3600 * 24 * 30]])
                ->groupBy(['product_id']);
            $querydb->innerJoin(['visits' => $visits], 'visits.product_id = prod.id');
        }
        if (!empty($requestData['profit'])) {
            $querydb->andWhere(['>', 'discount', 0.5]);
        }
        if (!empty($requestData['store_request'])) {
            $filter[] = ['store_id' => $requestData['store_request']];
        }
        if (!empty($filter)) {
            $querydb->andWhere(array_merge(['and'], $filter));
        }
        if ($category) {
            //есть категория
            //получить в т.ч. по дочерним категориям
            $querydb->innerJoin('cw_products_to_category pc', 'prod.id = pc.product_id')
                ->andWhere(['pc.category_id' => $category->childCategoriesId()]);
        }
        if (!empty($requestData['query'])) {
            $sql = 'SELECT * FROM products WHERE match(\'' . $requestData['query'] . '\') LIMIT ' . $requestData['limit'];
            $ids = array_column(Yii::$app->sphinx->createCommand($sql)->queryAll(), 'id');

            $querydb->andWhere(['prod.id' => $ids]);
        }

        return [
            'request_data' => $requestData,
            'cache_name' => $cacheName,
            'paginate_params' =>$paginateParams,
            'query_db' => $querydb,
            'category' => $category,
        ];
    }

}
