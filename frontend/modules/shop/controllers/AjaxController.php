<?php

namespace frontend\modules\shop\controllers;

use frontend\components\Pagination;
use frontend\components\SdController;
use frontend\modules\favorites\models\UsersFavorites;
use frontend\modules\product\models\Product;
use frontend\modules\stores\models\Stores;
use frontend\modules\vendor\models\Vendor;
use Yii;

class AjaxController extends SdController
{

  private $cache;
  private $region;
  private $lang;
  private $url;
  private $path;

  private $data_tree;
  private $data_list;

  private $category_id = 0;

  private $where = [];
  private $where_filter = [];

  private $mode = false;
  private $modeData = false;
  private $priceStartDB;
  private $priceEndDB;

  public function beforeAction($action)
  {
    $this->enableCsrfValidation = false;
    return parent::beforeAction($action);
  }

  public function createAction($id)
  {
    $request = Yii::$app->request;

    if (!$request->isAjax && !YII_DEBUG) {
      throw new \yii\web\NotFoundHttpException();
    }

    $this->cache = Yii::$app->cache_shop;
    $this->region = Yii::$app->params['region'];
    $this->lang = Yii::$app->params['lang_code'] == 'ru' ? false : Yii::$app->params['lang_code'];

    $this->data_tree = $this->cache->get('products_category_route_region_' . $this->region);
    $this->data_list = $this->cache->get('products_category_region_' . $this->region);

    $this->url = $request->post('url');
    //$this->url = '/ru/shop/zaschitnye-plenki/zaschitnye-plenki-dlya-planshetov';

    $this->url = trim($this->url, '/');

    //Чистим адрес от префикса региона/языка если надо
    $prefix = Yii::$app->params['url_prefix'];
    if (substr($this->url, 0, mb_strlen($prefix) + 1) == $prefix . '/') {
      $this->url = substr($this->url, mb_strlen($prefix) + 1);
    }
    $this->path = $this->url;

    //Если  запрос прилетел из вендора
    $prefix = 'vendor';
    if (
        substr($this->url, 0, mb_strlen($prefix) + 1) == $prefix . '/'
    ) {
      $this->url = substr($this->url, mb_strlen($prefix) + 1);
      //тут обработчик вендора делаем
    } else {

      //Если  запрос прилетел не из магазина то ошибка
      $prefix = 'shop';
      if (
          $this->url == $prefix ||
          substr($this->url, 0, mb_strlen($prefix) + 1) == $prefix . '/'
      ) {
        $this->url = substr($this->url, mb_strlen($prefix) + 1);
      } else {
        throw new \yii\web\NotFoundHttpException();
      }

      $url = explode('/', $this->url);
      //проверка на магазин
      $storesUsed = $this->cache->get('products_stores');
      if (count($url)==1 && isset($storesUsed[$url[0]])) {
        $this->mode='store';
        $storesUsed = $storesUsed[$url[0]];

        $this->where_filter['store']=$storesUsed['id'];
        $this->priceStartDB = $storesUsed['price_min'];
        $this->priceEndDB = $storesUsed['price_max'];

        $this->modeData = $storesUsed;
      }
    }

    if(!$this->mode) {
      //Проверка спец адресов
      if (in_array($this->url, [
          'query',
          'month',
          'profit',
      ])) {
        $this->mode = $this->url;
      } else {
        //Если в адресе что то есть то проверяем его на путь
        if (!empty($this->url)) {
          $paths = $this->data_tree;
          //проверяем пошгово путь. если есть ошибка то выдаем 404
          for ($i = 0; $i < count($url); $i++) {
            if (empty($paths) || !isset($paths[$url[$i]])) {
              throw new \yii\web\NotFoundHttpException();
            }
            $this->category_id = $paths[$url[$i]]['id'];
            $paths = $paths[$url[$i]]['children'];
          }
        }

        /*$this->where = [
            'category_id'=>$this->data_list[$this->category_id]
        ];*/

        if ($this->category_id) {
          $this->priceStartDB = $this->data_list[$this->category_id]['price_min'];
          $this->priceEndDB = $this->data_list[$this->category_id]['price_max'];
        }
      }
    }

    //ddd($this->data_list[$this->category_id]);
    return parent::createAction($id);
  }

  public function actionMenu()
  {
    $data = Yii::$app->cache->getOrSet('shop_menu_' . Yii::$app->params['url_prefix'], function () {
      return $this->buildTree($this->data_tree, $this->data_list);
    });

    return $this->renderAjax('left_menu.twig', [
        'categories' => $data
    ]);
  }

  private function buildTree($data_tree, $data_list)
  {
    $out = [];
    foreach ($data_tree as $item) {
      //если категории нет в базе то пропускаем ее
      if (empty($data_list[$item['id']])) {
        continue;
      }

      $store = $data_list[$item['id']];
      //если в категории нет товаров или она не активна то пропускаем ее
      if (!$store['active'] || $store['count'] == 0) {
        continue;
      }

      $store['count_all'] = $store['count'];
      unset($store['children_ids']);
      unset($store['price_min']);
      unset($store['price_max']);
      unset($store['vendor_list']);
      unset($store['stores_list']);
      unset($store['children']);
      unset($store['parent']);
      unset($store['active']);
      unset($store['store_id']);
      unset($store['count']);

      $store['name'] = $this->lang && !empty($item['names'][$this->lang]) ?
          $store['names'][$this->lang] : $store['name'];

      unset($store['names']);

      if (!empty($item['children'])) {
        $store['children'] = $this->buildTree($item['children'], $data_list);
      }
      $out[] = $store;

    }

    return $out;
  }

  private function getProductsDB()
  {
    $request = Yii::$app->request;

    $sortvars = Product::sortvars();
    $page = $this->request('page');
    $limit = null;//$this->request('limit');
    $sort_request = $this->request('sort');
    $priceStart = $this->request('price-start');
    $priceEnd = $this->request('price-end');

    $validator = new \yii\validators\NumberValidator();
    $validatorIn = new \yii\validators\RangeValidator(['range' => array_keys($sortvars)]);

    if(empty($page))$page=1;
    if (
        !empty($limit) && !$validator->validate($limit) ||
        !empty($page) && !$validator->validate($page) ||
        !empty($sort_request) && !$validatorIn->validate($sort_request) ||
        !empty($priceStart) && !$validator->validate($priceStart) ||
        !empty($priceEnd) && !$validator->validate($priceEnd)
    ) {
      throw new \yii\web\NotFoundHttpException;
    };
    //ddd($page, $limit,$sort_request,$priceStart,$priceEnd);

    if (!empty($sort_request)) {
      $sortDb = isset($sortvars[$sort_request]['name']) ? $sortvars[$sort_request]['name'] : $sort_request;
      $sort = $sort_request;
    } else {
      $sortDb = $sort = Product::$defaultSort;
    }

    $limit = (!empty($limit)) ? $limit : Product::$defaultLimit;
    $order = !empty($sortvars[$sort]['order']) ? $sortvars[$sort]['order'] : SORT_DESC;

    $requestData = [
        'limit' => $limit,
        'order' => $order,
        'sort_db' => $sortDb,
        'page' => $page,
        'sort_request' => $sort_request,
        'sort' => $sort,
    ];

    $cashName =
        ':page:' . $page .
        ':limit:' . $limit .
        ':order:' . $sort_request . '_' . $order .
        ':catalog:' . $this->category_id;

    $paginateParams = [
        'limit' => $limit,
        'sort' => $sort,
        'page' => $page,
        'isAjax'=>false,
    ];


    //готовим данные запроса
    $querydb = Product::items()
        ->orderBy([
            $sortDb => $order
        ]);

    if (!$this->mode && $this->category_id) {
      $category = $this->data_list[$this->category_id]['children_ids'];
      $category[] = $this->category_id;
      $querydb->innerJoin('cw_products_to_category pc', 'prod.id = pc.product_id')
          ->andWhere(['pc.category_id' => $category]);
    }

    $where = [];
    if (!empty($this->where_filter['vendor'])) {
      $where['vendor_id'] = $this->where_filter['vendor'];
      $cashName .= ':vendor:' . $this->where_filter['vendor'];
    }
    if (!empty($this->where_filter['store'])) {
      $where['store_id'] = $this->where_filter['store'];
      $cashName .= ':store:' . $this->where_filter['store'];
    }

    $requestData['cashCodeFilter'] = $cashName;

    $filter = ['and'];

    if ($priceStart && $priceStart > $this->priceStartDB) {
      $filter[] = ['>=', 'price', $priceStart];
      $cashName .= ':price_min:' . $priceStart;
      $paginateParams['price-start'] = $priceStart;
      $requestData['price_start_user']=$priceStart;
    }
    if ($priceEnd && $priceEnd < $this->priceEndDB) {
      $filter[] = ['<=', 'price', $priceEnd];
      $cashName .= ':price_max:' . $priceEnd;
      $paginateParams['price-end'] = $priceEnd;
      $requestData['price_end_user']=$priceEnd;
    }


    if (empty($where['vendor_id'])) {
      $requestVendor = $this->request('vendor',true);
      if ($requestVendor) {
        $requestData['vendor_get']=$requestVendor;
        $paginateParams['vendor'] = $requestVendor;
        $cashName .= ':vendors:' . implode(',', $requestVendor);
        $where['v.route'] = $requestVendor;
      }
    }

    if (empty($where['store_id'])) {
      $requestStore = $this->request('stores',true);

      if ($requestStore) {
        $paginateParams['stores'] = $requestStore;
        $cashName .= ':stores:' . implode(',', $requestStore);
        $where['s.route'] = $requestStore;
        $requestData['store_get']=$requestStore;
      }
    }

    $querydb->andWhere([
        'and',
        $where,
        $filter
    ]);

    $requestData['cashCode'] = $cashName;
    $requestData['querydb'] = $querydb;
    $requestData['paginate_params'] = $paginateParams;
    return $requestData;
  }

  public function actionContent()
  {
    $requestData = $this->getProductsDB();

    $pagination = new Pagination(
        $requestData['querydb'],
        'shop_content_' . $requestData['cashCode'],
        [
            'limit' => $requestData['limit'],
            'page' => $requestData['page'],
            'asArray' => true,
        ]
    );


    $data = [
        'products' => $pagination->data(),
        "total_v" => $pagination->count(),
        "total_all_product" => Product::activeCount(),
        "page" => $requestData['page'],
        "offset_products" => $pagination->offset(),
        "limit" => $requestData['limit'],
        "sortlinks" => $this->getSortLinks(
            $this->path,
            Product::sortvars(),
            Product::$defaultSort,
            $requestData['paginate_params']
        )
    ];

    $data["show_products"] = count($data['products']);

    if ($pagination->pages() > 1) {
      $data["pagination"] = $pagination->getPagination($this->path, $requestData['paginate_params']);
    }

    $data['favorites_ids'] = UsersFavorites::getUserFav(Yii::$app->user->id, true);

    return $this->renderAjax('content', $data);
  }

  public function actionFilter()
  {
    $requestData = $this->getProductsDB();

    $filter = [
        'store_get'=>isset($requestData['store_get'])?$requestData['store_get']:[],
        'vendor_get'=>isset($requestData['vendor_get'])?$requestData['vendor_get']:[],
        'price_start_user'=>isset($requestData['price_start_user'])?$requestData['price_start_user']:'',
        'price_end_user'=>isset($requestData['price_end_user'])?$requestData['price_end_user']:'',
    ];

    $pre_data = [];

    if ($this->mode == false) {
      if ($this->category_id == 0) return;

      $pre_data = $this->data_list[$this->category_id];
    } elseif($this->mode == 'store') {
      $pre_data = $this->modeData;
    }else{

      ddd($this);
    }

    if (!empty($pre_data['vendor_list'])) {
      $filter['vendors'] = $pre_data['vendor_list'];
    };
    if (!empty($pre_data['stores_list'])) {
      $filter['stores'] = $pre_data['stores_list'];
    };
    if (!empty($pre_data['price_min'])) {
      $filter['price_start'] = $pre_data['price_min'];
    };
    if (!empty($pre_data['price_max'])) {
      $filter['price_end'] = $pre_data['price_max'];
    };


    if (!empty($filter['vendors']) && count($filter['vendors']) > 1) {
      $filter['vendors'] = Vendor::items([
          'sort' => [
              'priority' => SORT_ASC,
              'name' => SORT_ASC
          ],
          'where' => [
              'v.id' => $filter['vendors']
          ]
      ]);
    } else {
      unset($filter['vendor']);
    }

    if (!empty($filter['stores']) && count($filter['stores']) > 1) {
      $filter['stores'] = Stores::toFilter([
          'sort' => [
              'priority' => SORT_ASC,
              'name' => SORT_ASC
          ],
          'where' => [
              'cws.uid' => $filter['stores']
          ]
      ], 'shop_filter_' . $requestData['cashCodeFilter']);
      //ddd($filter['stores']);
    } else {
      unset($filter['stores']);
    }

    $data = [
        'filter' => $filter,
    ];
    return $this->renderAjax('filter', $data);
  }

  private function request($name, $isArray = false){
    $request = Yii::$app->request;
    $data = !empty($request->post($name)) ? $request->post($name) :
        (!empty($request->get($name)) ? $request->get($name) : false);

    if(!$isArray){
      return is_array($data)?$data[0]:$data;
    }

    if(empty($data)){
      return [];
    }

    if(!is_array($data)){
      $data=[$data];
    }

    if(is_array($data[0])){
      foreach ($data as &$item){
        $item=$item[0];
      }
      return $data;
    }

    return $data;
  }
}