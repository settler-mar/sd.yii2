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

/**
 * Class DefaultController
 * @package frontend\modules\coupons\controllers
 */
class DefaultController extends SdController
{
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
    if ($category || $store) {
      $this->routeRedirects($category, $store);
      exit;
    }
    if ($actionId) {
      //имеется action, который должен быть категорией купонов или магазином, ищем такую
      if ($categoryCoupons = CategoriesCoupons::byRoute($actionId) or
        $store = Stores::byRoute($actionId)){
        //если есть одна из них
        //$this->checkParams();
        echo $this->actionIndex($actionId, $categoryCoupons, $store);
        exit;
      };
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


    $validator = new \yii\validators\NumberValidator();
    $validatorIn = new \yii\validators\RangeValidator(['range' => ['visit', 'date_start', 'date_end']]);
    if (!empty($limit) && !$validator->validate($limit) ||
      !empty($sort) && !$validatorIn->validate($sort)
    ) {
      throw new \yii\web\NotFoundHttpException;
    };
    $sort = (!empty($sort)) ? $sort : Coupons::$defaultSort;
    $limit = (!empty($limit)) ? $limit : $this->defaultLimit;
    $order = !empty(Coupons::$sortvars[$sort]['order']) ? Coupons::$sortvars[$sort]['order'] : 'DESC';

    $contentData["coupons_categories"] = Coupons::getActiveCategoriesCoupons();
    $contentData["stores_coupons"] = Coupons::getActiveStoresCoupons();
    $cacheName = 'catalog_coupons' . ($request->get('expired') ? '_expired' : ($request->get('all') ? '_all' : ''));
    $cacheName .= $page ? '_'.$page : '';
    $cacheName .= $limit ? '_'.$limit : '';
    $cacheName .= $sort ? '_'.$sort : '';
    $cacheName .= $order ? '_'.$order : '';

    $dateRange = $request->get('expired') ? ['<', 'cwc.date_end', date('Y-m-d H:i:s', time())] :
      ['>', 'cwc.date_end', date('Y-m-d H:i:s', time())];
    $contentData['show_expired'] = $request->get('expired');

    if (!empty($categoryCoupons)) {
      \Yii::$app->params['url_mask'] = 'coupons/category/'.$actionId;
      $category = $categoryCoupons->uid;
      $contentData["counts"] = Coupons::counts(false, $category);
      $cacheName .= '_' . $category;
      $contentData['category_id'] = $category;
      $contentData['current_category'] = $categoryCoupons;
      $databaseObj = Coupons::find()
        ->from(Coupons::tableName() . ' cwc')
        ->select(['cwc.*', 'cws.name as store_name', 'cws.route as store_route',
          'cws.currency as store_currency', 'cws.displayed_cashback as store_cashback',
          'cws.action_id as store_action_id', 'cws.logo as store_image'])
        ->innerJoin(Stores::tableName() . ' cws', 'cwc.store_id = cws.uid')
        ->innerJoin('cw_coupons_to_categories cctc', 'cctc.coupon_id = cwc.coupon_id')
        ->where(['cws.is_active' => [0, 1], 'cctc.category_id' => $category])
        ->andWhere($dateRange)
        ->orderBy($sort . ' ' . $order);
    } elseif (!empty($store)) {
      $storeId = $store->uid;
      if ($store->is_active == -1) {
        header("Location: /coupons",TRUE,301);
        exit;
        //return $this->redirect('/coupons', 301);
      }
      \Yii::$app->params['url_mask'] = 'coupons/store/'.$actionId;
      $contentData["counts"] = Coupons::counts($storeId);
      $contentData['current_store'] = $store;
      $cacheName .= '_' . $storeId;
      $contentData['affiliate_id'] = $storeId;
      $databaseObj = Coupons::find()
        ->select(['cwc.*', 'cws.name as store_name', 'cws.route as store_route', 'cws.is_offline as store_is_offline',
          'cws.currency as store_currency', 'cws.displayed_cashback as store_cashback',
          'cws.action_id as store_action_id', 'cws.logo as store_image'])
        ->from(Coupons::tableName() . ' cwc')
        ->innerJoin(Stores::tableName() . ' cws', 'cwc.store_id = cws.uid')
        ->where(['cws.is_active' => [0, 1], 'cwc.store_id' => $storeId])
        ->andWhere($dateRange)
        ->orderBy($sort . ' ' . $order);
       $contentData["store_rating"] = Reviews::storeRating($storeId);
    } else {
      $contentData["counts"] = Coupons::counts();
      \Yii::$app->params['url_mask'] = 'coupons';
      $databaseObj = Coupons::find()
        ->select(['cwc.*', 'cws.name as store_name', 'cws.route as store_route', 'cws.is_offline as store_is_offline',
          'cws.currency as store_currency', 'cws.displayed_cashback as store_cashback',
          'cws.action_id as store_action_id', 'cws.logo as store_image'])
        ->from(Coupons::tableName() . ' cwc')
        ->innerJoin(Stores::tableName() . ' cws', 'cwc.store_id = cws.uid')
        ->where(['cws.is_active' => [0, 1]])
        ->andWhere($dateRange)
        ->orderBy($sort . ' ' . $order);

    }
    \Yii::$app->params['url_mask'] .= ($request->get('expired') ? '/expired' : '');
    //\Yii::$app->params['url_mask'] .=  ($request->get('all') ? '/all' : '');//на будущее, если нужны будут метатеги для /all/
    $pagination = new Pagination($databaseObj, $cacheName, ['limit' => $limit, 'page' => $page, 'asArray' => true]);

    $contentData["coupons"] = $pagination->data();
    $contentData["total_v"] = $pagination->count();
    $contentData["show_coupons"] = count($contentData["coupons"]);
    $contentData["offset_coupons"] = $pagination->offset();
    $contentData["total_all_coupons"] = Coupons::activeCount();
    $contentData["page"] = empty($page) ? 1 : $page;
    $contentData["limit"] = empty($limit) ? $this->defaultLimit : $limit;
    $contentData["expired"] = $request->get('expired') ? 1 : null;

    $paginateParams = [
      'limit' => $this->defaultLimit == $limit ? null : $limit,
      'sort' => Coupons::$defaultSort == $sort ? null : $sort,
      'page' => $page,
      'expired' => $request->get('expired') ? 1 : null,
      'all' => $request->get('all') ? 1 : null,
    ];

    $paginatePath = '/' . ($actionId ? $actionId . '/' : '') . 'coupons';

    $contentData['is_root'] = (!$categoryCoupons && !$store);


    if ($pagination->pages() > 1) {
      $contentData["pagination"] = $pagination->getPagination($paginatePath, $paginateParams);
      $this->makePaginationTags($paginatePath, $pagination->pages(), $page, $paginateParams);
    }
    $contentData['sortlinks'] =
      $this->getSortLinks($paginatePath, Coupons::$sortvars, Coupons::$defaultSort, $paginateParams);
    $contentData['limitlinks'] =
      $this->getLimitLinks($paginatePath, Coupons::$defaultSort, $paginateParams);

    $contentData['slider'] = Slider::get();
    return $this->render('index', $contentData);
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
    header("Location: /coupons".$parent->route,TRUE,301);
    //$this->redirect('/coupons/'.$parent->route, 301)->send();
    exit;
  }

}
