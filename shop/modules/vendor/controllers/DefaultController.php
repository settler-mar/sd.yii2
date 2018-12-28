<?php

namespace shop\modules\vendor\controllers;

use common\components\Help;
use frontend\components\Pagination;
use frontend\components\SdController;
use frontend\modules\favorites\models\UsersFavorites;
use frontend\modules\stores\models\Stores;
use shop\modules\product\models\Product;
use shop\modules\vendor\models\Vendor;
use Yii;

class DefaultController extends SdController
{
    public function actionView($vendor)
    {
      if($vendor != \Yii::$app->help->makeRoute($vendor)){
        throw new \yii\web\NotFoundHttpException;
      }

      $vendor = Vendor::find()
          ->andWhere(['status'=>Vendor::STATUS_ACTIVE])
          ->andWhere(['route'=>$vendor])
          ->one();

      if(!$vendor){
        throw new \yii\web\NotFoundHttpException;
      }

      $request = \Yii::$app->request;
      $stores = Product::usedStores(['vendor_id' => $vendor->id]);

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
        $sortDb = isset($sortvars[$sort_request]['name']) ? $sortvars[$sort_request]['name'] : $sort_request;
        $sort = $sort_request;
      } else {
        $sortDb = $sort = Product::$defaultSort;
      }


      $limit = (!empty($limit)) ? $limit : Product::$defaultLimit;
      $order = !empty($sortvars[$sort_request]['order']) ? $sortvars[$sort_request]['order'] : SORT_DESC;

      $this->params['breadcrumbs'][] = ['label' => Yii::t('shop', 'category_product'), 'url' => Help::href('/category')];
      $this->params['breadcrumbs'][] = ['label' => $vendor->name, 'url' => Help::href('/vendor/'.$vendor->route)];

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
          ->orderBy([$sortDb => $order]);
      $language = Yii::$app->language  == Yii::$app->params['base_lang'] ? false : Yii::$app->language;
      $region = Yii::$app->params['region']  == 'default' ? false : Yii::$app->params['region'];
      $cacheName = 'catalog_product_' . $page . '_' . $limit . '_' . $sortDb . '_' . $order .
          ($language ? '_' . $language : '') . ($region? '_' . $region : '');

      $filter = [];
      $f_res = Product::conditionValues(
          'price',
          ['min','max'],
          ['vendor_id' => $vendor->id]
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

      $filter[] = ['vendor_id' => $vendor->id];
      $paginateParams['vendor'] = $vendor->route;

      if ($storeRequest) {
        $filter[] = ['store_id' => $storeRequest];
        $paginateParams['store'] = $storeRequest;

      }
      if (!empty($filter)) {
        $dataBaseData->andWhere(array_merge(['and'], $filter));
        $cacheName .= ('_' . Help::multiImplode('_', $filter));
      }
      //ddd($dataBaseData);
      $paginatePath = '/vendor/'.$vendor->route;

      $pagination = new Pagination(
          $dataBaseData,
          $cacheName,
          ['limit' => $limit, 'page' => $page, 'asArray'=> true]
      );

      $storesData['category'] = null;
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
          'vendors' => false, //??????????
          'vendors_user' => false,
          'stores' => $stores,
          'store_user' => $storeRequest ? $storeRequest : [],
      ];
      $storesData['vendor'] = false; //??????????
      return $this->render('@shop/modules/category/views/default/index', $storesData);
    }
}
