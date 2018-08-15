<?php

namespace frontend\modules\products\controllers;

use frontend\modules\stores\models\Stores;
use frontend\modules\products\models\Products;
use frontend\components\SdController;
use frontend\components\Pagination;
use common\components\Help;
use yii;

class DefaultController extends SdController
{

    //public $limitVars = [24, 50, 100];
    public $defaultLimit = 10;

    public function createAction($id)
    {
        $store = Stores::byRoute($id);
        if (!$store || !$store->show_products) {
            throw new \yii\web\NotFoundHttpException;
        }
        //$this->store = $store;
        echo $this->actionIndex($store);
        exit;
    }

    public function actionIndex($store)
    {
        //$store = $this->store;
        $request = Yii::$app->request;

        $page = $request->get('page');
        $limit = $request->get('limit');
        $sort = $request->get('sort');

        $sortvars = Products::$sortvars;
        $defaultSort = Products::$defaultSort;

        $validator = new \yii\validators\NumberValidator();
        $validatorIn = new \yii\validators\RangeValidator(['range' => array_keys($sortvars)]);
        if (!empty($limit) && !$validator->validate($limit)
            || !empty($sort) && !$validatorIn->validate($sort)
        ) {
            throw new \yii\web\NotFoundHttpException;
        };

        $sort = (!empty($sort)) ? $sort : $defaultSort;
        $limit = (!empty($limit)) ? $limit : $this->defaultLimit;
        $order = !empty($sortvars[$sort]['order']) ? $sortvars[$sort]['order'] : 'DESC';

        $this->params['breadcrumbs'][] = [
            'label' => (Yii::t('main', 'breadcrumbs_products')),
        ];
        $this->params['breadcrumbs'][] = [
            'label' => $store->name,
            'url' => Help::href('/products/' . $store->route),
        ];
        if ($page > 1) {
            $this->params['breadcrumbs'][] = Yii::t('main', 'breadcrumbs_page').' ' . $page;
        }
        $dataBaseData = Products::find()
            ->select(['cw_products.*', 'last_price as price',  'round(abs(buy_count*4.67+sin(uid)*30))+1 as buy'])
            ->where(['and',
                ['store_id' => $store->uid],
                ['is not', 'url', null],
                ['>', 'url', ''],
                ['<>', 'title', '-'],
            ])
            ->orderBy($sort . ' ' . $order)
        ;
        $language = Yii::$app->language  == Yii::$app->params['base_lang'] ? false : Yii::$app->language;
        $region = Yii::$app->params['region']  == 'default' ? false : Yii::$app->params['region'];
        $cacheName = 'catalog_products'. $store->uid.'_' . $page . '_' . $limit . '_' .
            $sort . '_' . $order .
            ($language ? '_' . $language : '') . ($region? '_' . $region : '') ;

        $pagination = new Pagination(
            $dataBaseData,
            $cacheName,
            ['limit' => $limit, 'page' => $page, 'asArray'=>true]
        );

        $paginateParams = [
            'limit' => $this->defaultLimit == $limit ? null : $limit,
            'sort' => $defaultSort == $sort ? null : $sort,
            'page' => $page,
        ];

        $paginatePath = '/' . $store->route. '/products';
        if ($pagination->pages() > 1) {
            $storesData["pagination"] = $pagination->getPagination($paginatePath, $paginateParams);
            $this->makePaginationTags($paginatePath, $pagination->pages(), $page, $paginateParams);
        }
        $statProducts = clone $dataBaseData;
        $updateTime = $statProducts
            ->select('max(last_buy) as time')
            ->orderBy(null)
            ->asArray()
            ->one();
        $updateTime = $updateTime['time'];

        $products = $pagination->data();

        //ddd($products);

        $data = [
            'store' => $store,
            'products' => $products,
            "total_v" => $pagination->count(),
            "show_products" => count($products),
            "offset_products" => $pagination->offset(),
            "page" => empty($page) ? 1 : $page,
            "limit" => empty($limit) ? $this->defaultLimit : $limit,
            'sortlinks' => $this->getSortLinks($paginatePath, $sortvars, $defaultSort, $paginateParams),
            'limitlinks' => $this->getLimitLinks($paginatePath, $defaultSort, $paginateParams),
            'update_time' => $updateTime,
        ];
        if ($pagination->pages() > 1) {
            $data["pagination"] = $pagination->getPagination($paginatePath, $paginateParams);
            $this->makePaginationTags($paginatePath, $pagination->pages(), $page, $paginateParams);
        }
        //ddd($data);

        return $this->render('catalog', $data);
    }

}
