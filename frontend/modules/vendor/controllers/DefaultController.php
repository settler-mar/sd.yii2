<?php

namespace frontend\modules\vendor\controllers;

use yii;
use yii\web\Controller;
use common\components\Help;
use frontend\components\Pagination;
use frontend\components\SdController;
use frontend\modules\favorites\models\UsersFavorites;
use frontend\modules\stores\models\Stores;
use frontend\modules\product\models\Product;
use frontend\modules\vendor\models\Vendor;

class DefaultController extends SdController
{

    public function createAction($id)
    {
        $this->params['disable_breadcrumbs_home_link'] = 1;//для виджета крошек
        $id = (string) $id;
        if ($id) {
            echo $this->actionIndex($id);
            exit;
        }
        return parent::createAction($id);
    }

    public function actionIndex($vendor)
    {
        Yii::$app->params['url_mask'] = 'vendor';

        if ($vendor != \Yii::$app->help->makeRoute($vendor)) {
            throw new \yii\web\NotFoundHttpException;
        }

        $vendor = Vendor::find()
            ->andWhere(['status'=>Vendor::STATUS_ACTIVE])
            ->andWhere(['route'=>$vendor])
            ->one();

        if (!$vendor) {
            throw new \yii\web\NotFoundHttpException;
        }

        $request = \Yii::$app->request;
        $stores = Product::usedStores(['where' => ['vendor_id' => $vendor->id]]);

        $page = $request->get('page');
        $limit = $request->get('limit');
        $sort_request = $request->get('sort');
        $priceStart = $request->get('price-start');
        $priceEnd = $request->get('price-end');

        $storeRequest = $request->get('store_id');

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
        $order = !empty($sortvars[$sort]['order']) ? $sortvars[$sort]['order'] : SORT_DESC;

        $this->params['breadcrumbs'][] = ['label' => Yii::t('shop', 'category_product'), 'url' => Help::href('/shop')];
        $this->params['breadcrumbs'][] = ['label' => $vendor->name, 'url' => Help::href('/vendor/'.$vendor->route)];

        $storesData = [];
        $dataBaseData = Product::items()->andWhere(['prod.vendor_id'=> $vendor->id])->orderBy([$sortDb => $order]);
//        $dataBaseData = Product::find()
//            ->from(Product::tableName() . ' prod')
//            ->innerJoin(Stores::tableName(). ' s', 's.uid = prod.store_id')
//            ->innerJoin(Vendor::tableName(). ' v', 'v.id = prod.vendor_id')
//            ->where(['prod.available' => [Product::PRODUCT_AVAILABLE_YES, Product::PRODUCT_AVAILABLE_REQUEST]])
//            ->andWhere(['prod.vendor_id'=> $vendor->id])
//            ->select(['prod.*', 'prod.currency as product_currency','s.name as store_name', 's.route as store_route',
//                's.displayed_cashback as displayed_cashback', 's.action_id as action_id', 's.uid as store_id',
//                's.is_active as store_active', 'v.name as vendor', 'v.route as vendor_route',
//                's.currency as currency', 's.action_end_date as action_end_date',
//                'if (prod.old_price, (prod.old_price - prod.price)/prod.old_price, 0) as discount'])
//            ->orderBy([$sortDb => $order]);
        $language = Yii::$app->language  == Yii::$app->params['base_lang'] ? false : Yii::$app->language;
        $region = Yii::$app->params['region']  == 'default' ? false : Yii::$app->params['region'];
        $cacheName = 'catalog_product_' . $page . '_' . $limit . '_' . $sortDb . '_' . $order .
            ($language ? '_' . $language : '') . ($vendor ? '_vendor_' . $vendor->id : '') . ($region? '_' . $region : '');

        $filter = [];
        $where['vendor_id'] = $vendor->id;
        if (isset($storeRequest)) {
            $where['store_id'] = $storeRequest;
        }
        $f_res = Product::conditionValues(
            'price',
            ['min','max'],
            ['where' => $where]
        );
        $filterPriceEndMax = (int)$f_res['max_price'];
        $filterPriceStartMin=(int)$f_res['min_price'];

        $paginateParams = [
            'limit' => $limit,
            'sort' => $sort,
            'page' => $page,
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

        if ($storeRequest) {
            $filter[] = ['store_id' => $storeRequest];
            $paginateParams['store'] = $storeRequest;

        }
        $paginatePath = '/vendor/'.$vendor->route;
        if (!empty($filter)) {
            $dataBaseData->andWhere(array_merge(['and'], $filter));
            $cacheName .= ('_' . Help::multiImplode('_', $filter));
            $this->params['breadcrumbs'][] = [
                'label' => Yii::t('shop', 'filter_result'),
                'url' => Help::href($paginatePath . '&' . http_build_query($paginateParams)),
            ];
            Yii::$app->params['url_mask'] = 'shop/filter';
        }

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

        $stores = Product::usedStores([
            'database' => $dataBaseData
        ]);

        $storesData['favorites_ids'] = UsersFavorites::getUserFav(8, true);
        $filterPriceEndMax = $filterPriceStartMin == $filterPriceEndMax ? $filterPriceEndMax + 1 : $filterPriceEndMax;
        $storesData['filter'] = [
            'price_start' => $filterPriceStartMin,
            'price_end' => $filterPriceEndMax,
            'price_start_user' => $priceStart && $priceStart > $filterPriceStartMin ? $priceStart : $filterPriceStartMin,
            'price_end_user' => $priceEnd && ($priceEnd < $filterPriceEndMax || $filterPriceEndMax ==0) ? $priceEnd : $filterPriceEndMax,
            'vendors' => false, //??????????
            'vendors_user' => false,
            'stores' => $stores,
            'store_user' => $storeRequest ? $storeRequest : [],
        ];
        $storesData['vendor'] = $vendor->name; //для мета
        return $this->render('@frontend/modules/shop/views/default/category', $storesData);
    }
}
