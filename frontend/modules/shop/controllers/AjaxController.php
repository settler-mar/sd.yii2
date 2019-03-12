<?php

namespace frontend\modules\shop\controllers;

use frontend\components\Pagination;
use frontend\components\SdController;
use frontend\modules\favorites\models\UsersFavorites;
use frontend\modules\product\models\Product;
use Yii;

class AjaxController extends SdController
{

  private $cache;
  private $region;
  private $lang;
  private $url;

  private $data_tree;
  private $data_list;

  private $category_id = 0;

  private $where = [];
  private $where_filter = [];

  private $mode = false;
  private $priceStartDB;
  private $priceEndDB;

  public function beforeAction($action) {
    $this->enableCsrfValidation = false;
    return parent::beforeAction($action);
  }

  public function createAction($id)
  {
    $request = Yii::$app->request;

    if (!$request->isAjax && ! YII_DEBUG) {
      throw new \yii\web\NotFoundHttpException();
    }

    $this->cache = Yii::$app->cache_shop;
    $this->region = Yii::$app->params['region'];
    $this->lang = Yii::$app->params['lang_code']=='ru' ? false : Yii::$app->params['lang_code'];

    $this->data_tree = $this->cache->get('products_category_route_region_' . $this->region);
    $this->data_list = $this->cache->get('products_category_region_' . $this->region);

    $this->url = $request->post('url');
    //$this->url = '/ru/shop/zaschitnye-plenki/zaschitnye-plenki-dlya-planshetov';
    $this->url = trim($this->url,'/');

    //Чистим адрес от префикса региона/языка если надо
    $prefix=Yii::$app->params['url_prefix'];
    if(substr($this->url, 0, mb_strlen($prefix)+1)==$prefix.'/'){
      $this->url = substr($this->url, mb_strlen($prefix)+1);
    }

    //Если  запрос прилетел не из магазина то ошибка
    $prefix = 'shop';
    if(
        $this->url==$prefix ||
        substr($this->url, 0, mb_strlen($prefix)+1)==$prefix.'/'
    ){
      $this->url = substr($this->url, mb_strlen($prefix)+1);
    }else{
      throw new \yii\web\NotFoundHttpException();
    }

    //Проверка спец адресов
    if(in_array($this->url,[
        'query',
        'month',
        'profit',
    ])){
      $this->mode=$this->url;
    }else {
      //Если в адресе что то есть то проверяем его на путь
      if (!empty($this->url)) {
        $url = explode('/', $this->url);
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

      if($this->category_id){
        $this->priceStartDB = $this->data_list[$this->category_id]['price_min'];
        $this->priceEndDB = $this->data_list[$this->category_id]['price_max'];
      }
    }

    //ddd($this->data_list[$this->category_id]);
    return parent::createAction($id);
  }

  public function actionMenu()
  {
    $data = Yii::$app->cache->getOrSet('shop_menu_'.Yii::$app->params['url_prefix'],function(){
      return $this->buildTree($this->data_tree, $this->data_list);
    });

    return $this->renderAjax('left_menu.twig',[
        'categories'=> $data
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

      $store['name'] = $this->lang && !empty($item['names'][$this->lang])?
          $store['names'][$this->lang]:$store['name'];

      unset($store['names']);

      if (!empty($item['children'])) {
        $store['children'] = $this->buildTree($item['children'], $data_list);
      }
      $out[] = $store;

    }

    return $out;
  }

  private function getProductsDB(){
    $request = Yii::$app->request;

    $sortvars = Product::sortvars();
    $page = $request->get('page');
    $limit = $request->get('limit');
    $sort_request = $request->get('sort');
    $priceStart = $request->get('price-start');
    $priceEnd = $request->get('price-end');


    $validator = new \yii\validators\NumberValidator();
    $validatorIn = new \yii\validators\RangeValidator(['range' => array_keys($sortvars)]);

    if (!empty($limit) && !$validator->validate($limit) ||
        !empty($page) && !$validator->validate($page) ||
        !empty($sort_request) && !$validatorIn->validate($sort_request) ||
        !empty($priceStart) && !$validator->validate($priceStart) ||
        !empty($priceEnd) && !$validator->validate($priceEnd)
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

    $requestData = [
        'limit' => $limit,
        'order' => $order,
        'sort_db' => $sortDb,
        'page' => $page,
        'sort_request' => $sort_request,
        'sort' => $sort,
    ];

    $cashName =
        ':page:'.$page .
        ':limit:' . $limit .
        ':order:' . $sortDb . '_' . $order .
        ':catalog:' . $this->category_id;

    $paginateParams = [
        'limit' => $limit,
        'sort' => $sort,
        'page' => $page,
    ];


    //готовим данные запроса
    $querydb = Product::items()
        ->orderBy([
            $sortDb => $order
        ]);

    if(!$this->mode && $this->category_id){
      $category = $this->data_list[$this->category_id]['children_ids'];
      $category[] = $this->category_id;
      $querydb->innerJoin('cw_products_to_category pc', 'prod.id = pc.product_id')
          ->andWhere(['pc.category_id' => $category]);
    }

    $where = [];
    if (!empty($this->where_filter['vendor'])) {
      $where['vendor_id'] = $this->where_filter['vendor'];
      $cashName.=':vendor:'.implode('|',$this->where_filter['vendor']);
    }
    if (isset($this->where_filter['store'])) {
      $where['store_id'] = $this->where_filter['store'];
      $cashName.=':store:'.implode('|',$this->where_filter['store']);
    }

    $filter = ['and'];
    if ($priceStart && $priceStart > $this->priceStartDB) {
      $filter[] = ['>=', 'price', $priceStart];
      $cashName.=':price_min:'.$priceStart;
      $paginateParams['price-start'] = $priceStart;
    }
    if ($priceEnd && $priceEnd < $this->priceEndDB) {
      $filter[] = ['<=', 'price', $priceEnd];
      $cashName.=':price_max:'.$priceEnd;
      $paginateParams['price-end'] = $priceEnd;
    }

    $querydb->andWhere([
        'and',
        $where,
        $filter
    ]);

    $requestData['cashCode'] = $cashName;
    $requestData['querydb'] = $querydb;
    $requestData['paginate_params']=$paginateParams;
    return $requestData;
  }

  public function actionContent(){
    $requestData = $this->getProductsDB();

    $pagination = new Pagination(
        $requestData['querydb'],
        'shop_content_'.$requestData['cashCode'],
        [
            'limit' => $requestData['limit'],
            'page' => $requestData['page'],
            'asArray' => true
        ]
    );

    $data=[
        'products' => $pagination->data(),
        "total_v" => $pagination->count(),
        "total_all_product" => Product::activeCount(),
        "page"=>$requestData['page'],
        "offset_products" => $pagination->offset(),
        "limit" => $requestData['limit'],
    ];
    $data["show_products"] = count($data['products']);

    if ($pagination->pages() > 1) {
      $data["pagination"] = $pagination->getPagination($this->url, $requestData['paginate_params']);
    }

    $data['favorites_ids'] = UsersFavorites::getUserFav(Yii::$app->user->id, true);

    return $this->renderAjax('content', $data);
  }
}