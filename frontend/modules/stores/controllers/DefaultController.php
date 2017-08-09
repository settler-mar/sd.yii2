<?php

namespace frontend\modules\stores\controllers;

//use yii\web\Controller;
//use frontend\components\SdController;
use yii;
use frontend\components\SdController;
use frontend\modules\stores\models\Stores;
use frontend\modules\stores\models\PromoStores;
use frontend\modules\category_stores\models\CategoryStores;
use frontend\components\Pagination;

class DefaultController extends SdController
{
    public function actionIndex()
    {
        $request = Yii::$app->request;

        $page = $request->get('page');
        $limit = $request->get('limit');
        $sort = $request->get('sort');
        $category = $request->get('category');

        $validator = new \yii\validators\NumberValidator();
        $validatorIn = new \yii\validators\RangeValidator(['range' => ['visit', 'name', 'added',
            'cashback_percent', 'cashback_summ']]);
        if (!empty($limit) && !$validator->validate($limit) ||
           !empty($page) && !$validator->validate($page) ||
           !empty($category) && !$validator->validate($category) ||
           !empty($sort) && !$validatorIn->validate($sort)
        ) {
            throw new \yii\web\NotFoundHttpException;
        };

        $sort = (!empty($sort)) ? $sort : Stores::$defaultSort;
        $limit = (!empty($limit)) ? $limit : $this->defaultLimit;
        $order = !empty(Stores::$sortvars[$sort]['order']) ? Stores::$sortvars[$sort]['order'] : 'DESC';


        $storesData = [];
        //$stores = new Stores();
        //$storesData = $stores->getStores();
        if (!empty($category)) {
            //категория
            $storesData['current_category'] = CategoryStores::find()->where(['uid' => $category])->one();
            if ($storesData['current_category'] == null) {
                //todo на отработку отсутствующей страницы пока на 404
                throw new \yii\web\NotFoundHttpException;
            }
            $dataBaseData = Stores::find()
                ->from(Stores::tableName() . ' cws')
                ->select([
                    'cws.*',
                    'cstc.category_id',
                    "substr(displayed_cashback, locate(' ', displayed_cashback)+1, locate('%', displayed_cashback)".
                    " - locate(' ', displayed_cashback) -1) + 0 as  cashback_percent",
                    "substr(displayed_cashback, locate(' ', displayed_cashback)+1, length(displayed_cashback)".
                    " - locate(' ', displayed_cashback) - locate('%', displayed_cashback)) + 0 as cashback_summ",

                ])
                ->innerJoin('cw_stores_to_categories cstc', 'cws.uid = cstc.store_id')
                ->where([
                    'cstc.category_id' => $category,
                    'is_active' => [0, 1],
                ])
                 ->orderBy($sort .' '.$order);
            $pagination = new Pagination(
                $dataBaseData,
                'catalog_stores_category' . '_' .$category . '_' . $limit. '_' . $sort,
                ['limit' => $limit, 'page' => $page, 'asArray' => 1]
            );
            $storesData['stores'] = $pagination->data();
        } else {
            //нет категории /stores
            $dataBaseData = Stores::find()
                ->select([
                    '*',
                    "substr(displayed_cashback, locate(' ', displayed_cashback)+1, locate('%', displayed_cashback)".
                    " - locate(' ', displayed_cashback) -1) + 0 as  cashback_percent",
                    "substr(displayed_cashback, locate(' ', displayed_cashback)+1, length(displayed_cashback)".
                    " - locate(' ', displayed_cashback) - locate('%', displayed_cashback)) + 0 as cashback_summ",

                ])
                ->where(['not in', 'is_active', [-1]])
                ->orderBy($sort .' '.$order);
            $pagination = new Pagination(
                $dataBaseData,
                'catalog_stores_' . $limit. '_' . $sort,
                ['limit' => $limit, 'page' => $page, 'asArray' => 1]
            );
            $storesData['stores'] = $pagination->data();
        }

        $storesData["total_v"] = $pagination->count();
        $storesData["show_stores"] = count($storesData['stores']);
        $storesData["offset_stores"] = $pagination->offset();
        $storesData["total_all_stores"] = Stores::activeCount();

        $paginateParams = [
            'category' => $category,
            'limit' => $this->defaultLimit == $limit ? null : $limit,
            'sort' => Stores::$defaultSort == $sort ? null : $sort,
            'page' => $page,
        ];
        if ($pagination->pages() > 1) {
            $storesData["pagination"] = $pagination->getPagination($request->pathInfo, $paginateParams);
            $this->makePaginationTags($request->pathInfo, $pagination->pages(), $page, $paginateParams);
        }

        $storesData['sortlinks'] =
            $this->getSortLinks($request->pathInfo, Stores::$sortvars, Stores::$defaultSort, $paginateParams);
        $storesData['limitlinks'] =
            $this->getLimitLinks($request->pathInfo, Stores::$defaultSort, $paginateParams);

        return $this->render('catalog', $storesData);
    }
}

