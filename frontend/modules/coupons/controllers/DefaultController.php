<?php

namespace frontend\modules\coupons\controllers;

//use yii\web\Controller;
use frontend\components\SdController;
use frontend\modules\coupons\models\Coupons;
use frontend\modules\coupons\models\CategoriesCoupons;
use frontend\modules\stores\models\Stores;
use frontend\components\Pagination;

/**
 * Class DefaultController
 * @package frontend\modules\coupons\controllers
 */
class DefaultController extends SdController
{
    /**
     * @return string
     * @throws \yii\web\NotFoundHttpException
     */
    public function actionIndex()
    {
        $request = \Yii::$app->request;
        $page = $request->get('page');
        $limit = $request->get('limit');
        $sort = $request->get('sort');
        $category = $request->get('category');
        $store = $request->get('store');

        $validator = new \yii\validators\NumberValidator();
        $validatorIn = new \yii\validators\RangeValidator(['range' => ['visit', 'date_start', 'date_end']]);
        if (!empty($limit) && !$validator->validate($limit) ||
            !empty($page) && !$validator->validate($page) ||
            !empty($category) && !$validator->validate($category) ||
            !empty($store) && !$validator->validate($store) ||
            !empty($sort) && !$validatorIn->validate($sort)
        ) {
            throw new \yii\web\NotFoundHttpException;
        };
        $sort = (!empty($sort)) ? $sort : Coupons::$defaultSort;
        $limit = (!empty($limit)) ? $limit : $this->defaultLimit;
        $order = !empty(Coupons::$sortvars[$sort]['order']) ? Coupons::$sortvars[$sort]['order'] : 'DESC';

        $contentData["coupons_categories"] = Coupons::getActiveCategoriesCoupons();
        $contentData["stores_coupons"] = Coupons::getActiveStoresCoupons();

        if (!empty($category)) {
            $cat = CategoriesCoupons::byId($category);
            if (!$cat) {
                throw new \yii\web\NotFoundHttpException;
            }
            $cacheName = 'coupons_category_'.$category.'_'.$page.'_'.$limit.'_'.$sort.'_'.$order;
            $contentData['category_id'] = $category;
            $contentData['current_category'] = $cat;
            $databaseObj = Coupons::find()
                ->from(Coupons::tableName(). ' cwc')
                ->select(['cwc.*', 'cws.name as store_name', 'cws.route as store_route',
                    'cws.currency as store_currency', 'cws.displayed_cashback as store_cashback',
                    'cws.action_id as store_action_id'])
                ->innerJoin(Stores::tableName() . ' cws', 'cwc.store_id = cws.uid')
                ->innerJoin('cw_coupons_to_categories cctc', 'cctc.coupon_id = cwc.coupon_id')
                ->where(['cws.is_active' => [0, 1], 'cctc.category_id' => $category])
                ->orderBy($sort.' '.$order);
        } elseif (!empty($store)) {
            $shop = Stores::byId($store);
            if (!$shop) {
                throw new \yii\web\NotFoundHttpException;
            }
            if ($shop->is_active == -1) {
                return $this->redirect('/coupons', 301);
            }
            $cacheName = 'coupons_store_'.$store.'_'.$page.'_'.$limit.'_'.$sort.'_'.$order;
            $contentData['affiliate_id'] = $store;
            $databaseObj = Coupons::find()
                ->select(['cwc.*', 'cws.name as store_name', 'cws.route as store_route',
                    'cws.currency as store_currency', 'cws.displayed_cashback as store_cashback',
                    'cws.action_id as store_action_id'])
                ->from(Coupons::tableName(). ' cwc')
                ->innerJoin(Stores::tableName() . ' cws', 'cwc.store_id = cws.uid')
                ->where(['cws.is_active' => [0, 1], 'cwc.store_id' => $store])
                ->orderBy($sort.' '.$order);
        } else {
            $cacheName = 'coupons_'.$page.'_'.$limit.'_'.$sort.'_'.$order;
            $databaseObj = Coupons::find()
                ->select(['cwc.*', 'cws.name as store_name', 'cws.route as store_route',
                    'cws.currency as store_currency', 'cws.displayed_cashback as store_cashback',
                    'cws.action_id as store_action_id'])
                ->from(Coupons::tableName(). ' cwc')
                ->innerJoin(Stores::tableName() . ' cws', 'cwc.store_id = cws.uid')
                ->where(['cws.is_active' => [0, 1]])
                ->orderBy($sort.' '.$order);
        }
        $pagination = new Pagination($databaseObj, $cacheName, ['limit' => $limit, 'page' => $page, 'asArray' => true]);

        $contentData["coupons"] = $pagination->data();
        $contentData["total_v"] = $pagination->count();
        $contentData["show_coupons"] = count($contentData["coupons"]);
        $contentData["offset_coupons"] = $pagination->offset();
        $contentData["total_all_coupons"] = Coupons::activeCount();
        $contentData["page"] = empty($page) ? 1 : $page;
        $contentData["limit"] = empty($limit) ? $this->defaultLimit : $limit;

        $paginateParams = [
            'category' => $category,
            'store' => $store,
            'limit' => $this->defaultLimit == $limit ? null : $limit,
            'sort' => Coupons::$defaultSort == $sort ? null : $sort,
            'page' => $page,
        ];
        if ($pagination->pages() > 1) {
            $contentData["pagination"] = $pagination->getPagination($request->pathInfo, $paginateParams);
            $this->makePaginationTags($request->pathInfo, $pagination->pages(), $page, $paginateParams);
        }
        $contentData['sortlinks'] =
            $this->getSortLinks($request->pathInfo, Coupons::$sortvars, Coupons::$defaultSort, $paginateParams);
        $contentData['limitlinks'] =
            $this->getLimitLinks($request->pathInfo, Coupons::$defaultSort, $paginateParams);

        return $this->render('index', $contentData);
    }
}
