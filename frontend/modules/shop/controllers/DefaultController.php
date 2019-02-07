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
    public $category = null;
    public $product = null;
    public $store = null;


    private $requestData = [];
    private $cacheName = '';
    private $paginatePath = '';
    private $paginateParams = [];

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
                Yii::$app->params['url_mask'] = 'shop/*';
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
                Yii::$app->params['url_mask'] = 'shop/store/*';
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
            'limit' => 15,
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
        $this->getRequestData();

        $this->params['breadcrumbs'][] = ['label' => Yii::t('shop', 'category_product'), 'url' => Help::href('/shop')];

        $storesData = [];

        $storesData['category'] = $this->category;

        $storesData['store'] = $this->store;

        $storesData['sortlinks'] =
            $this->getSortLinks(
                $this->paginatePath,
                Product::sortvars(),
                Product::$defaultSort,
                $this->paginateParams
            );

        //какие блоки обновляются по каким адресам
        $params = array_merge(Yii::$app->request->get(), $this->requestData);
        $params = http_build_query($params);
        //ddd($this->requestData);
        //формируем новые гет-параметры
        $filterUrl = '/shop/filter' . ($params ? '?' . $params : '');
        $titleUrl = '/shop/title' . ($params ? '?' . $params : '');
        $storesData['requests'] = json_encode([
            ['blocks'=> ["catalog-products-content", "catalog-products-info"]],
            ['blocks' => ["catalog_products-filter"], 'url' => Yii::$app->help->href($filterUrl)],
            ['blocks' => ["catalog_products-title"], 'url' => Yii::$app->help->href($titleUrl)],
        ]);
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
        $this->getRequestData();

        $pagination = new Pagination(
            $this->getDatabaseData(),
            $this->cacheName,
            [
                'limit' => $this->requestData['query'] ? 48 : $this->requestData['limit'],
                'page' => $this->requestData['page'],
                'asArray'=> true
            ]
        );

        $storesData['category'] = $this->category;
        $storesData['products'] = $pagination->data();
        $storesData["total_v"] = $pagination->count();
        $storesData["total_all_product"] = Product::activeCount();
        $storesData["page"] = empty($this->requestData['page']) ? 1 : $this->requestData['page'];
        $storesData["show_products"] = count($storesData['products']);
        $storesData["offset_products"] = $pagination->offset();
        $storesData["limit"] = empty($limit) ? Product::$defaultLimit : $limit;

        if ($pagination->pages() > 1) {
            $storesData["pagination"] = $pagination->getPagination($this->paginatePath, $this->paginateParams);
            //$this->makePaginationTags($paginatePath, $pagination->pages(), $page, $paginateParams);
        }
        if ($this->requestData['page']> 1) {
            $this->params['breadcrumbs'][] = Yii::t('main', 'breadcrumbs_page').' ' . $this->requestData['page'];
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
        $this->requestData = Yii::$app->request->get();
        $pagination = new Pagination($this->getDatabaseData(), $this->cacheName, ['limit' => 1]);
        $storesData['category'] = isset($this->requestData['category_id']) ?
            ProductsCategory::findOne($this->requestData['category_id']) : null;
        $storeData['store'] = isset($this->requestData['store_id']) ?
            Stores::byId($this->requestData['store_id']) : null;

        $storesData["total_v"] = $pagination->count();

        $meta = Meta::findByUrl(urldecode($this->requestData['url_mask']));
        $storesData['h1'] =  $meta && isset($meta['h1']) ? $meta['h1'] : null;

        $file = file_get_contents(Yii::getAlias('@frontend/modules/shop/views/default/ajax/title.twig'));
        $str =  Yii::$app->TwigString->render($file, $storesData);
        return  Yii::$app->TwigString->render($str, $storesData);
    }


    /** выдача фильтра
     * @return string
     */
    public function actionFilter()
    {
        $this->requestData = Yii::$app->request->get();

        $where = [];
        if (!empty($this->requestData['vendor_db'])) {
            $where['vendor_id'] = $this->requestData['vendor_db'];
        }
        if (isset($this->requestData['store_request'])) {
            $where['store_id'] = $this->requestData['store_request'];
        }

        $this->category = isset($this->requestData['category_id']) ?
             ProductsCategory::findOne($this->requestData['category_id']) : null;

        $pricesResult = Product::conditionValues(
            'price',
            ['min', 'max'],
            [
                'category' => $this->category,
                'where' => $where,
            ]
        );
        $filterPriceEndMax = (int)$pricesResult['max_price'];
        $filterPriceStartMin=(int)$pricesResult['min_price'];

        if ($this->requestData['price_start'] && $this->requestData['price_start'] != $filterPriceStartMin) {
            $filter[] = ['>=', 'price', $this->requestData['price_start']];
        }

        if ($this->requestData['price_end'] && $this->requestData['price_end'] != $filterPriceEndMax) {
            $priceEnd = $this->requestData['price_end'] < $this->requestData['price_start'] ?
                $this->requestData['price_start'] : $this->requestData['price_end'];
            $filter[] = ['<=', 'price', $priceEnd];
        }

        $dataBaseData = $this->getDatabaseData();

        $vendors =  Vendor::items([
            'sort'=>['priority'=>SORT_ASC, 'name'=>SORT_ASC],
            'database' => $dataBaseData,
        ]);

         $stores = isset($this->requestData['store_request']) ? [] : Product::usedStores([
             'sort'=>['priority'=>SORT_ASC, 'name'=>SORT_ASC],
             'database' => $dataBaseData
         ]);

         $storesData['filter'] = [
             'price_start' => $filterPriceStartMin,
             'price_end' => $filterPriceEndMax,
             'price_start_user' => $this->requestData['price_start'] && $this->requestData['price_start'] > $filterPriceEndMax
                 ? $this->requestData['price_start'] : $filterPriceStartMin,
             'price_end_user' => $this->requestData['price_end'] &&
                ($this->requestData['price_end'] < $filterPriceEndMax || $filterPriceEndMax == 0) ?
                 $this->requestData['price_end'] : $filterPriceEndMax,
             'vendors' => $vendors,
             'vendors_user' => !empty($this->requestData['vendor_request']) ? $this->requestData['vendor_request'] : false,
             'stores' => $stores,
             'store_user' => isset($this->requestData['store_request']) ? $this->requestData['store_request'] : [],
             'query' => !empty($this->requestData['query']) ? $this->requestData['query'] : false,
             'action' => $this->requestData['path'],//чтобы не попал page
             'limit' => !empty($this->requestData['query']) ? $this->requestData['limit'] : false,
             'month' => !empty($this->requestData['month']) ? $this->requestData['month'] : false,
             'profit' => !empty($this->requestData['profit']) ? $this->requestData['profit'] : false,
         ];

         return $this->renderPartial('ajax/filter.twig', $storesData);
    }


    //готовим запрос базы данных
    protected function getDatabaseData()
    {
        $dataBaseData = Product::items()->orderBy([$this->requestData['sort_db'] => $this->requestData['order']]);

        $filter = [];
        $where = [];
        if (!empty($this->requestData['vendor_db'])) {
            $where['vendor_id'] = $this->requestData['vendor_db'];
        }
        if (isset($this->requestData['store_request'])) {
            $where['store_id'] = $this->requestData['store_request'];
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

        if ($this->requestData['price_start'] && $this->requestData['price_start'] != $filterPriceStartMin) {
            $filter[] = ['>=', 'price', $this->requestData['price_start']];
            $this->paginateParams['price-start'] = $this->requestData['price_start'];
        }
        if ($this->requestData['price_end'] && $this->requestData['price_end'] != $filterPriceEndMax) {
            $priceEnd = $this->requestData['price_end'] < $this->requestData['price_start'] ?
                $this->requestData['price_start'] : $this->requestData['price_end'];
            $filter[] = ['<=', 'price', $priceEnd];
            $this->paginateParams['price-end'] = $priceEnd;
        }
        if (isset($this->requestData['vendor_request']) && !empty($requestData['vendor_db'])) {
            $filter[] = ['vendor_id' => $requestData['vendor_db']];
        }
        if (!empty($this->requestData['month'])) {
            $visits = UsersVisits::find()
                ->select(['product_id', 'count(*) as count'])
                ->where(['and', ['>', 'product_id', 0], ['>', 'visit_date', time() - 3600 * 24 * 30]])
                ->groupBy(['product_id']);
            $dataBaseData->innerJoin(['visits' => $visits], 'visits.product_id = prod.id');
        }
        if (!empty($this->requestData['profit'])) {
            $dataBaseData->andWhere(['>', 'discount', 0.5]);
        }
        if (!empty($this->requestData['store_request'])) {
            $filter[] = ['store_id' => $this->requestData['store_request']];
        }
        if (!empty($filter)) {
            $dataBaseData->andWhere(array_merge(['and'], $filter));
        }
        if ($this->category) {
            //есть категория
            //получить в т.ч. по дочерним категориям
            $dataBaseData->innerJoin('cw_products_to_category pc', 'prod.id = pc.product_id')
                ->andWhere(['pc.category_id' => $this->category->childCategoriesId()]);
        }
        if (!empty($this->requestData['query'])) {
            $sql = 'SELECT * FROM products WHERE match(\'' . $this->requestData['query'] . '\') LIMIT ' . $this->requestData['limit'];
            $ids = array_column(Yii::$app->sphinx->createCommand($sql)->queryAll(), 'id');

            $dataBaseData->andWhere(['prod.id' => $ids]);
        }


        return $dataBaseData;
    }


    //формируем данные запроса
    private function getRequestData()
    {
        $request = Yii::$app->request;
        $vendorRequest = $request->get('vendor');
        if ($this->store) {
            //шоп из роут
            $storeRequest = $this->store->uid;
        } else {
            $storeRequest = $request->get('store_id') ? (int) $request->get('store_id') : null;
        }

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

        $this->requestData = [
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
            'store_request' => $storeRequest,
            'vendor_request' => $vendorRequest,
            'vendor_db' => isset($vendorDb) ? $vendorDb : null,
            'sort' => $sort,
            'category_id' => $this->category ? $this->category->id : null,
            'store_id' => $this->store ? $this->store->uid : null,
            'path' => '/'. $request->pathInfo,
            'url_mask' => urlencode(
                isset(Yii::$app->params['url_mask']) ? Yii::$app->params['url_mask'] : $request->pathInfo
            )

        ];
        $language = Yii::$app->language  == Yii::$app->params['base_lang'] ? false : Yii::$app->language;
        $region = Yii::$app->params['region']  == 'default' ? false : Yii::$app->params['region'];
        $cacheName = 'catalog_product_' . $page . '_' . $limit . '_' . $sortDb . '_' . $order .
            ($language ? '_' . $language : '') . ($region? '_' . $region : '') . ($query ? '_query_'.$query : '') .
            ($month ? '_month_' : '').($profit ? '_profit_' : '') .
            ($vendorRequest ? ' _vendor_' . Help::multiImplode('_', $vendorRequest) : '');
        if ($this->category) {
            $cacheName .= '_category_' . $this->category->route;
        }
        $this->cacheName = $cacheName;
        $this->paginateParams = [
           'limit' => $limit,
           'sort' => $sort,
           'page' => $page,
        ];
    }

}
