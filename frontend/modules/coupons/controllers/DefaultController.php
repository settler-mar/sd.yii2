<?php

namespace frontend\modules\coupons\controllers;

//use yii\web\Controller;
use frontend\components\SdController;
use frontend\modules\coupons\models\Coupons;
use frontend\modules\coupons\models\CategoriesCoupons;
use frontend\modules\stores\models\Stores;
//use frontend\modules\category_stores\models\CategoryStores;
use frontend\modules\slider\models\Slider;
use frontend\components\Pagination;
use frontend\modules\reviews\models\Reviews;
use frontend\models\RouteChange;
use frontend\modules\sdblog\models\Posts;
use yii;
use common\components\Help;

/**
 * Class DefaultController
 * @package frontend\modules\coupons\controllers
 */
class DefaultController extends SdController
{
    protected $top = false;
    protected $new = false;

    public $defaultLimit = 30;

   /**
   * @param string $actionId
   * @return null|string|\yii\base\Action
   * @throws \yii\web\NotFoundHttpException
   */
  public function createAction($actionId)
  {

    $request = \Yii::$app->request;
    //здесь делаются редиректы со старых роутов, поэтому делаем проверку для параметров старых роутов
    //передаваемых в запросе быть не должно
    $this->checkWrongParams(['coupon', 'id']);
    
    $category = $request->get('category');
    $store = $request->get('store');
    $coupon_id=$request->get('params');
    if($coupon_id && !is_numeric($coupon_id)){
      throw new \yii\web\NotFoundHttpException;
    }

    if ($category || $store) {
      $this->routeRedirects($category, $store);
      exit;
    }

    if ($actionId) {
      //имеется action, который должен быть категорией купонов или магазином, ищем такую
      if ($categoryCoupons = CategoriesCoupons::byRoute($actionId) or
        $store = Stores::byRoute($actionId)){
        //если есть одна из них

        if($coupon_id){
          $coupon=Coupons::forList(false)->andWhere(['cwc.uid'=>$coupon_id])->one();
          if(!$coupon || $store->uid!=$coupon['store_id']){
            throw new \yii\web\NotFoundHttpException;
          }
          echo $this->actionCoupon($store, $coupon);
        }else{
          echo $this->actionIndex($actionId, $categoryCoupons, $store);
        }
        exit;
      }

      if($coupon_id){
        throw new \yii\web\NotFoundHttpException;
      }

      if ($actionId == 'top') {
          $this->top = true;
          echo $this->actionIndex($actionId);
          exit;
      }
      if ($actionId == 'new') {
          $this->new = true;
          echo $this->actionIndex($actionId);
          exit;
      }
      if ($actionId == 'abc') {
          echo $this->actionAbc();
          exit;
      }
      if ($actionId == 'search') {
          echo $this->actionSearch();
          exit;
      }

      //если нет категории или магазина
      //найти в удалённых шопах или категориях купонов
      $newRoute = RouteChange::getNew(
        $actionId,
        [RouteChange::ROUTE_TYPE_CATEGORY_COUPONS, RouteChange::ROUTE_TYPE_STORES]
      );

      if ($newRoute){
        //если есть новый роут для удалённого, делаем редирект
        header("Location: /coupons".$newRoute,TRUE,301);
        //$this->redirect('/coupons/'.$newRoute, 301)->send();
        exit;
      };

      throw new \yii\web\NotFoundHttpException;
    }

    if($coupon_id){
      throw new \yii\web\NotFoundHttpException;
    }
    return parent::createAction($actionId);
  }

  /**
   * @return string
   * @throws \yii\web\NotFoundHttpException
   */
  public function actionIndex($actionId = '', $categoryCoupons = null, $store = null)
  {
    $request = \Yii::$app->request;
    $page = $request->get('page');
    $limit = $request->get('limit');
    $sort = $request->get('sort');
    $storeFrom = $request->get('w');
    $json = $request->isAjax && $request->get('g') != 'ajax_load' || $request->get('g') == 'plugin';

    $this->params['breadcrumbs'][] = ['label' => Yii::t('main', 'breadcrumbs_coupons'), 'url'=>Help::href('/coupons')];
    if ($this->top) {
      $sort = 'visit';
    }

    $validator = new \yii\validators\NumberValidator();
    $validatorIn = new \yii\validators\RangeValidator(['range' => ['visit', 'date_start', 'date_end']]);
    if (!empty($limit) && !$validator->validate($limit) ||
      !empty($sort) && !$validatorIn->validate($sort)
    ) {
      throw new \yii\web\NotFoundHttpException;
    };
    $sort = (!empty($sort)) ? $sort : Coupons::$defaultSort;
    $limit = (!empty($limit)) ? $limit : $this->defaultLimit;
    $sortvars = Coupons::sortvars();
    $order = !empty($sortvars[$sort]['order']) ? $sortvars[$sort]['order'] : 'DESC';

    $contentData["coupons_categories"] = Coupons::getActiveCategoriesCoupons();
    $cacheName = 'catalog_coupons' . ($request->get('expired') ? '_expired' : ($request->get('all') ? '_all' : ''));
    $cacheName .= $page ? '_'.$page : '';
    $cacheName .= $limit ? '_'.$limit : '';
    $cacheName .= $sort ? '_'.$sort : '';
    $cacheName .= $order ? '_'.$order : '';
    $cacheName .= $storeFrom ? '_'.$storeFrom : '';

    $expiredData=['<', 'cwc.date_end', date('Y-m-d H:i:s', time())];
    $dateRange = $request->get('expired') ? $expiredData :
      ['>', 'cwc.date_end', date('Y-m-d H:i:s', time())];
    //$contentData['show_expired'] = $request->get('expired');

    if (!empty($categoryCoupons)) {
      $this->params['breadcrumbs'][] = ['label' => $categoryCoupons->name, 'url'=>Help::href('/coupons/'.$categoryCoupons->route)];
        \Yii::$app->params['url_mask'] = 'coupons/category/'.$actionId;
      $category = $categoryCoupons->uid;
      $this->current_coupon_category_id = $category;
      $contentData["counts"] = Coupons::counts(false, $category);
      $cacheName .= '_' . $category;
      $contentData['category_id'] = $category;
      $contentData['current_category'] = $categoryCoupons;
      $databaseObj = Coupons::forList($json)
        ->innerJoin('cw_coupons_to_categories cctc', 'cctc.coupon_id = cwc.uid')
        //->where(['cws.is_active' => [0, 1], 'cctc.category_id' => $category])
        ->andWhere(['cws.is_active' => [1], 'cctc.category_id' => $category])
        ->andWhere($dateRange)
        ->orderBy($sort . ' ' . $order);

    } elseif (!empty($store)) {
      $storeId = $store->uid;
      $this->params['breadcrumbs'][] = ['label' => $store->name, 'url'=>Help::href('/coupons/'.$store->getRouteUrl())];
      if ($store->is_active == -1) {
        header("Location: /coupons",TRUE,301);
        exit;
        //return $this->redirect('/coupons', 301);
      }
      \Yii::$app->params['url_mask'] = 'coupons/store/'.$actionId.($store->cpaLink->cpa_id == 2 ? '/online' : '');
      $contentData["counts"] = Coupons::counts($storeId);
      $contentData['current_store'] = $store;
      if($store){
        $contentData['coupon_ended']=Coupons::find()
            ->from(Coupons::tableName() . ' cwc')
            ->where(['store_id' => $store->uid])
            ->andWhere($expiredData)
            //->asArray()
            ->limit(10)
            ->all();
      }
      $cacheName .= '_' . $storeId;
      $contentData['affiliate_id'] = $storeId;
      $databaseObj = Coupons::forList($json)
        //->where(['cws.is_active' => [0, 1], 'cwc.store_id' => $storeId])
        ->andWhere(['cws.is_active' => [1], 'cwc.store_id' => $storeId])
        ->andWhere($dateRange)
        ->orderBy($sort . ' ' . $order);
      $contentData["store_rating"] = Reviews::storeRating($storeId);
      Yii::$app->view->metaTags[] = '<meta property="og:image" content="https://secretdiscounter.ru/images/logos/'.$store->logo.'" />';

    } else {
      $contentData["counts"] = Coupons::counts();
      \Yii::$app->params['url_mask'] = 'coupons';
      $databaseObj = Coupons::forList($json)
        //->where(['cws.is_active' => [0, 1]])
        ->andWhere(['cws.is_active' => [1]])
        ->andWhere($dateRange)
        ->orderBy($sort . ' ' . $order);
      if ($this->top) {
          //top 20
        //$sort = 'cws.visit';
        $limit = 50;
        $cacheName .= '_' . $actionId;
        $this->params['breadcrumbs'][] = ['label' => 'Топ 50'];
        \Yii::$app->params['url_mask'] = 'coupons/top';
      }
      if ($this->new) {
          //новые
        $this->params['breadcrumbs'][] = ['label' => Yii::t('main', 'coupons_menu_new'), 'url'=>Help::href('/coupons/new')];
        $databaseObj->andWhere(['>', 'date_start', date('Y-m-d', time()-60*60*24* Coupons::NEW_COUPONS_SUB_DAYS)]);
        $cacheName .= '_' . $actionId;
        \Yii::$app->params['url_mask'] = 'coupons/new';
      }
    }

    if ($storeFrom) {
       //алфавитный поиск
        if ($storeFrom == '0‑9') {
            $databaseObj->andWhere(['or',
                  ['like', 'cws.name', '0%', false],
                  ['like', 'cws.name', '1%', false],
                  ['like', 'cws.name', '2%', false],
                  ['like', 'cws.name', '3%', false],
                  ['like', 'cws.name', '4%', false],
                  ['like', 'cws.name', '5%', false],
                  ['like', 'cws.name', '6%', false],
                  ['like', 'cws.name', '7%', false],
                  ['like', 'cws.name', '8%', false],
                  ['like', 'cws.name', '9%', false],
            ]);
        } else {
            $databaseObj->andWhere(['like', 'cws.name', $storeFrom.'%', false]);
        }
        $this->params['breadcrumbs'][] = [
            'label' => $storeFrom,
            'url' => Help::href('/coupons'. ($categoryCoupons ? '/' . $categoryCoupons->route : '') .'?w=' .  $storeFrom),
        ];
    }

    \Yii::$app->params['url_mask'] .= ($request->get('expired') ? '/expired' : '');
    //\Yii::$app->params['url_mask'] .=  ($request->get('all') ? '/all' : '');//на будущее, если нужны будут метатеги для /all/
    $pagination = new Pagination($databaseObj, $cacheName, ['limit' => $limit, 'page' => $page, 'one_page'=> $this->top]);

    $contentData["coupons"] = $pagination->data();
    $contentData["total_v"] = $pagination->count();
    $contentData["show_coupons"] = count($contentData["coupons"]);
    $contentData["offset_coupons"] = $pagination->offset();
    $contentData["total_all_coupons"] = Coupons::activeCount();
    $contentData["page"] = empty($page) ? 1 : $page;
    $contentData["limit"] = empty($limit) ? $this->defaultLimit : $limit;
    $contentData["expired"] = $request->get('expired') ? 1 : null;
    //$contentData['show_expired'] = $request->get('expired');
    $contentData["popular_stores"] = $this->popularStores();
    $contentData['search_form'] = 1;

    $paginateParams = [
      'limit' => $this->defaultLimit == $limit || $this->top ? null : $limit,
      'sort' => Coupons::$defaultSort == $sort ? null : $sort,
      'page' => $page,
      'expired' => $request->get('expired') ? 1 : null,
      'all' => $request->get('all') ? 1 : null,
      'w' => $storeFrom ? $storeFrom : null,
    ];

    $paginatePath = '/coupons/' . ($actionId ? $actionId  : '');

    $contentData['is_root'] = (!$categoryCoupons && !$store && !$this->top && !$this->new);
    $contentData['top'] = $this->top;
    $contentData['new'] = $this->new;
    if ($page>1) {
        $this->params['breadcrumbs'][] = ['label' => Yii::t('main', 'breadcrumbs_page').' '.$page];
    }

    if ($pagination->pages() > 1) {
      $contentData["pagination"] = $pagination->getPagination($paginatePath, $paginateParams);
      $this->makePaginationTags($paginatePath, $pagination->pages(), $page, $paginateParams);
    }

    if($request->get('expired')){
      foreach ($sortvars as $k=>$item){
        if($k=='date_start'){
          unset ($sortvars[$k]);
        }
      }
    }

    $contentData['sortlinks'] =
      $this->getSortLinks($paginatePath, $sortvars, Coupons::$defaultSort, $paginateParams);
    $contentData['limitlinks'] =
      $this->getLimitLinks($paginatePath, Coupons::$defaultSort, $paginateParams);

    //непонятно, нужно сюда выводить или не нужно
    $contentData["coupons_top5"] =  Coupons::top(['limit' => 5,'unique_store'=>true]);

    $contentData["counts_all"] = Coupons::counts();
    $contentData['coupons_view']=isset($_COOKIE['coupons_view']) ? $_COOKIE['coupons_view'] : '';

    $contentData['menu_subscribe'] = 1;
    $contentData['posts'] = Posts::getLastPosts();
    $contentData["stores_abc"] = Stores::getActiveStoresByAbc([
        'for_stores' => false,
        'char_list_only'=> true,
        'category_id' => isset($category) ? $category : false
    ]);
    $contentData['stores_abc_w'] = $storeFrom ? $storeFrom : null;
    $contentData["users_reviews"] = Reviews::top();

    if ($json) {
      return json_encode([
        'coupons' => $contentData["coupons"],
        'coupon_ended' => isset($contentData["coupon_ended"]) ? $contentData["coupon_ended"] : [],
        'counts' => $contentData["counts"],
        'counts_all' => $contentData["counts_all"],
        'page' => $contentData["page"],
        'total_v' => $contentData["total_v"],
        'offset_coupons' => $contentData["offset_coupons"],
        'total_all_coupons' => $contentData["total_all_coupons"],
      ]);
    }
    return $this->render('catalog', $contentData);
  }


  public function actionCoupon($store, $coupon){
    $request = \Yii::$app->request;
    $page = $request->get('page');
    $limit = $request->get('limit');
    $sort = $request->get('sort');
    $this->params['breadcrumbs'][] = ['label' => Yii::t('main', 'breadcrumbs_coupons'), 'url'=>Help::href('/coupons')];
    $this->params['breadcrumbs'][] = ['label' => $store->name, 'url'=>Help::href('/coupons/'.$store->getRouteUrl())];
    $this->params['breadcrumbs'][] = [
        'label' => $coupon['name'],
        'url' => Help::href('/coupons/' . $store->getRouteUrl() . '/' . $coupon['uid'])
    ];
    $contentData["coupons_categories"] = Coupons::getActiveCategoriesCoupons();
    $contentData["popular_stores"] = $this->popularStores();
    $contentData["total_v"] = Coupons::activeCount();
    //$contentData['store']=$store;
    $contentData['coupon']=$coupon;

    $actionId=$store->route;
    $storeId=$coupon['store_id'];

    $validator = new \yii\validators\NumberValidator();
    $validatorIn = new \yii\validators\RangeValidator(['range' => ['visit', 'date_start', 'date_end']]);
    if (!empty($limit) && !$validator->validate($limit) ||
        !empty($sort) && !$validatorIn->validate($sort)
    ) {
      throw new \yii\web\NotFoundHttpException;
    };
    $sort = Coupons::$defaultSort;
    $limit = 10;//(!empty($limit)) ? $limit : $this->defaultLimit;
    $order = 'DESC';

    $contentData["coupons_categories"] = Coupons::getActiveCategoriesCoupons();
    $cacheName = 'catalog_coupons' . ($request->get('expired') ? '_expired' : ($request->get('all') ? '_all' : ''));
    $cacheName .= $page ? '_'.$page : '';
    $cacheName .= $limit ? '_'.$limit : '';
    $cacheName .= $sort ? '_'.$sort : '';
    $cacheName .= $order ? '_'.$order : '';

    $dateRange = $request->get('expired') ? ['<', 'cwc.date_end', date('Y-m-d H:i:s', time())] :
        ['>', 'cwc.date_end', date('Y-m-d H:i:s', time())];
    //$contentData['expired'] = $request->get('expired');

    $expiredData=['<', 'date_end', date('Y-m-d H:i:s', time())];
    $contentData['coupon_ended']=Coupons::find()
        ->where(['store_id' => $coupon['store_id']])
        ->andWhere($expiredData)
        //->asArray()
        ->limit(10)
        ->all();

    \Yii::$app->params['url_mask'] = 'coupon/stores/'.$actionId.'/id/'.$coupon['uid'];
    $contentData["counts"] = Coupons::counts($storeId);
    $contentData['current_store'] = $store;
    $cacheName .= '_' . $storeId;
    $contentData['affiliate_id'] = $storeId;
    $databaseObj = Coupons::forList(false)
        ->andWhere(['cws.is_active' => [0, 1], 'cwc.store_id' => $storeId])
        ->andWhere($dateRange)
        ->orderBy($sort . ' ' . $order)
        ->andWhere(['!=','cwc.uid',$coupon['uid']]);

    $pagination = new Pagination($databaseObj, $cacheName, ['limit' => $limit, 'page' => $page, 'one_page'=> $this->top]);

    $contentData["stores_coupon"] = $pagination->data();
    $contentData["total_v"] = $pagination->count();
    $contentData["show_coupons"] = count($contentData["stores_coupon"]);
    $contentData["offset_coupons"] = $pagination->offset();
    $contentData["total_all_coupons"] = Coupons::activeCount();
    $contentData["page"] = empty($page) ? 1 : $page;
    $contentData["limit"] = empty($limit) ? $this->defaultLimit : $limit;
    //$contentData["expired"] = $request->get('expired') ? 1 : null;
    $contentData["popular_stores"] = $this->popularStores();
    $contentData["coupons_reviews"] = Reviews::byStoreId(0, $coupon['uid']);

    $paginateParams = [
        //'limit' => $this->defaultLimit == $limit ? null : $limit,
        'sort' => Coupons::$defaultSort == $sort ? null : $sort,
        'page' => $page,
        'expired' => $request->get('expired') ? 1 : null,
        'all' => $request->get('all') ? 1 : null,
    ];
    $paginatePath = '/' . $store->getRouteUrl() . '/coupons/' . $coupon['uid'];

    $contentData['is_root'] = false;
    if ($page>1) {
      $this->params['breadcrumbs'][] = ['label' => Yii::t('main', 'breadcrumbs_page').' '.$page];
    }

    if ($pagination->pages() > 1) {
      $contentData["pagination"] = $pagination->getPagination($paginatePath, $paginateParams);
      $this->makePaginationTags($paginatePath, $pagination->pages(), $page, $paginateParams);
    }

    $contentData['expired']=(time()>strtotime($coupon['date_end']));

    $contentData["coupons_top5"] = Coupons::top(['limit' => 5]);
    $contentData['search_form'] = 1;
    $contentData['menu_subscribe'] = 0;//true;
    $contentData['posts'] = Posts::getLastPosts();

    $contentData['products_store'] = Stores::findOne(['uid'=>93]);

    return $this->render('card', $contentData);
  }
  /**
   * @param $coupon
   * @param $store
   * @throws \yii\web\NotFoundHttpException
   * из маршрутизации "по-старому" перенаправления на "по-новому"
   */
  public function routeRedirects($coupon, $store)
  {
    if ($coupon && $store) {
      //так нельзя, 404
      throw new \yii\web\NotFoundHttpException;
    }
    if ($coupon) {
      //категория купона
      $parent = CategoriesCoupons::byId($coupon);
      if (!$parent) {
        throw new \yii\web\NotFoundHttpException;
      }
    } else {
      //шоп
      $parent = Stores::byId($store);
      if (!$parent || $parent->is_active == -1 || count($parent->coupons) == 0) {
        throw new \yii\web\NotFoundHttpException;
      }
    }
    header("Location: /coupons/".$parent->route, TRUE, 301);
    //$this->redirect('/coupons/'.$parent->route, 301)->send();
    exit;
  }

    /**
     * поиск в купонах
     * @return string
     * @throws yii\web\NotFoundHttpException
     */
  public function actionSearch()
  {
      $request = \Yii::$app->request;
      $page = $request->get('page');
      $limit = $request->get('limit');
      $sort = $request->get('sort');
      $sortvars = Coupons::sortvars();


      $validator = new \yii\validators\NumberValidator();
      $validatorIn = new \yii\validators\RangeValidator(['range' => ['visit', 'date_start', 'date_end']]);
      if (!empty($limit) && !$validator->validate($limit) ||
          !empty($sort) && !$validatorIn->validate($sort)
      ) {
          throw new \yii\web\NotFoundHttpException;
      };
      $sort = (!empty($sort)) ? $sort : Coupons::$defaultSort;
      $limit = (!empty($limit)) ? $limit : $this->defaultLimit;
      $order = !empty($sortvars[$sort]['order']) ? $sortvars[$sort]['order'] : 'DESC';

      $query =  isset(Yii::$app->params['search_query']) ? Yii::$app->params['search_query'] : false;

      $databaseObj = Coupons::forList(false)
          //->andWhere(['cws.is_active' => [0, 1]])
          ->andWhere(['cws.is_active' => [1]])
          ->andWhere(['>', 'cwc.date_end', date('Y-m-d H:i:s', time())])
          ->orderBy($sort . ' ' . $order);
      if ($query) {
          $databaseObj->andWhere(Stores::makeQueryArray($query));
      }

      $pagination = new Pagination($databaseObj, false, ['limit' => $limit, 'page' => $page, ]);
      $contentData['coupons'] = $pagination->data();
      $contentData["total_v"] = $pagination->count();
      $contentData["show_coupons"] = count($contentData["coupons"]);
      $contentData["offset_coupons"] = $pagination->offset();
      $contentData["total_all_coupons"] = Coupons::activeCount();
      $contentData["page"] = empty($page) ? 1 : $page;
      $contentData["limit"] = empty($limit) ? $this->defaultLimit : $limit;
      $contentData['h1'] = Yii::t('main', 'coupons_search_h1'). ' "'.$query.'"';

      $contentData['search_form'] = 1;
      $contentData['is_root'] = false;

      $paginateParams = [
          'limit' => $this->defaultLimit == $limit ? null : $limit,
          'sort' => Coupons::$defaultSort == $sort ? null : $sort,
          'page' => $page,
          'expired' => $request->get('expired') ? 1 : null,
          'all' => $request->get('all') ? 1 : null,
          'query' => $query
      ];
      $paginatePath = '/coupon/search';


      $this->params['breadcrumbs'][] = ['label' => Yii::t('main', 'breadcrumbs_search'), 'url'=>'/search/coupon?query='.$query];
      if ($page>1) {
          $this->params['breadcrumbs'][] = ['label' => Yii::t('main', 'breadcrumbs_page').' '.$page];
      }

      if ($pagination->pages() > 1) {
          $contentData["pagination"] = $pagination->getPagination($paginatePath, $paginateParams);
          $this->makePaginationTags($paginatePath, $pagination->pages(), $page, $paginateParams);
      }

      $contentData['sortlinks'] =
          $this->getSortLinks($paginatePath, $sortvars, Coupons::$defaultSort, $paginateParams);
      $contentData['limitlinks'] =
          $this->getLimitLinks($paginatePath, Coupons::$defaultSort, $paginateParams);

      $contentData['search_result'] = 1;

      return $this->render('catalog', $contentData);
  }

  private function actionAbc()
  {
      //\Yii::$app->params['url_mask'] = 'coupons';
      $this->params['breadcrumbs'][] = ['label' => Yii::t('main', 'breadcrumbs_coupons'), 'url'=>'/coupons'];
      $this->params['breadcrumbs'][] = ['label' => Yii::t('main', 'breadcrumbs_search_abc')];
      $contentData["coupons_categories"] = Coupons::getActiveCategoriesCoupons();
      $contentData["stores_abc"] = Stores::getActiveStoresByAbc(['for_stores' => false]);
      $contentData["popular_stores"] = $this->popularStores();
      $contentData["total_v"] = Coupons::activeCount();
      $contentData['search_form'] = 1;
      $contentData['posts'] = Posts::getLastPosts();

      return $this->render('abc', $contentData);
  }

    /**
     * шопы, имеющие активные купоны, по количеству использованных купонов
     * @return mixed
     */
  protected function popularStores()
  {
       $cashe = Yii::$app->cache;
       $stores = $cashe->getOrSet('popular_stores_with_promocodes', function(){
           $subQuery = Stores::find()
               ->select(['cws.uid', 'cws.name', 'cws.route', 'sum(cwc.visit) as visit'])
               ->from(Stores::tableName() . ' cws')
               ->leftJoin(Coupons::tableName() . ' cwc', 'cwc.store_id = cws.uid')
               ->where(['cws.is_active' => [0, 1]])
               ->groupBy('cws.uid')
               ->orderBy('visit DESC')
               ->having(['>', 'visit', 0])
               ->limit(50);

           return Stores::find()
               ->select(['cws.uid', 'cws.name', 'cws.route', 'count(*) as count', 'sq.visit'])
               ->from(Stores::tableName() . ' cws')
               ->leftJoin(['sq' => $subQuery], 'sq.uid = cws.uid')
               ->leftJoin(Coupons::tableName() . ' cwc', 'cwc.store_id = cws.uid')
               ->where(['cws.is_active' => [0, 1]])
               ->andWhere(['>', 'cwc.date_end', date('Y-m-d H:i:s', time())])
               ->andWhere(['>', 'sq.visit', 0])
               ->groupBy('cws.uid')
               ->having(['>', 'count', 0])
               ->orderBy(['visit'=>SORT_DESC, 'count'=>SORT_DESC])
               ->asArray()
               ->limit(50)
               ->all();
       }, Yii::$app->cache->defaultDuration);

      return $stores;
  }

}
