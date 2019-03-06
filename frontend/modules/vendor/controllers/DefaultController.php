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
use frontend\modules\shop\controllers\DefaultController as ShopController;

class DefaultController extends SdController
{
    private $category = null;
    private $product = null;
    private $store = null;

    private $requestData = [];
    private $cacheName = '';
    private $paginatePath = '';
    private $paginateParams = [];
    protected $vendor;

    public function createAction($id)
    {
        $this->params['disable_breadcrumbs_home_link'] = 1;//для виджета крошек
        $id = (string) $id;
        if ($id) {
            if ($id != \Yii::$app->help->makeRoute($id)) {
                throw new \yii\web\NotFoundHttpException;
            }
            $vendor = Vendor::find()
                ->andWhere(['status'=>Vendor::STATUS_ACTIVE])
                ->andWhere(['route'=>$id])
                ->one();
            if (!$vendor) {
                throw new \yii\web\NotFoundHttpException;
            }
            $this->vendor = $vendor;
            if (Yii::$app->request->isAjax) {
                //данные айаксом
                echo $this->actionData($id);
                exit;
            }
            echo $this->actionIndex($id);
            exit;
        }
        return parent::createAction($id);
    }

    public function actionIndex()
    {
        $request = Yii::$app->request;
        $vendor = $this->vendor;

        if(empty($vendor->id)){
          throw new \yii\web\NotFoundHttpException;
        }
        //для запросов получить параметры запроса
        $requestData = ShopController::getRequestData([
            'vendor_id' =>$vendor->id,
            'url_mask' => 'vendor/*'

        ]);

        $this->params['breadcrumbs'][] = ['label' => Yii::t('shop', 'category_product'), 'url' => Help::href('/shop')];
        $this->params['breadcrumbs'][] = ['label' => $this->vendor->name, 'url' => Help::href('/vendor/'.$this->vendor->route)];
        Yii::$app->params['url_mask'] = 'vendor/*';
        $filter = $request->get();
        if (!empty($filter)) {
            $this->params['breadcrumbs'][] = [
                'label' => Yii::t('shop', 'filter_result'),
                'url' => Help::href('/vendor/'.$this->vendor->route . '?' . http_build_query($filter)),
            ];
        }


        $storesData = [];

        $storesData['vendor'] = $vendor->name;


        $storesData['sortlinks'] =
            $this->getSortLinks(
                $requestData['request_data']['path'],
                Product::sortvars(),
                Product::$defaultSort,
                $requestData['paginate_params']
            );

        $this->paginatePath = $requestData['request_data']['path'];

        //какие блоки обновляются по каким адресам
        $params = array_merge(Yii::$app->request->get(), $requestData['request_data']);
        $params['vendor'] = $vendor->route;

        $params = http_build_query($params);
        //формируем новые гет-параметры
        $filterUrl = '/shop/filter' . ($params ? '?' . $params : '');
        $titleUrl = '/shop/title' . ($params ? '?' . $params : '');
        //$dataUrl = '/shop' . ($params ? '?' . $params : '');
        $storesData['requests'] = json_encode([
            ['blocks'=> ["catalog-products-content", "catalog-products-info", "catalog-categories_count"]],
            ['blocks' => ["catalog_products-filter"], 'url' => Yii::$app->help->href($filterUrl)],
            //['blocks' => ["catalog_products-title"], 'url' => Yii::$app->help->href($titleUrl)],
        ]);
        if ($requestData['request_data']['page']> 1) {
            $this->params['breadcrumbs'][] = Yii::t('main', 'breadcrumbs_page').' ' . $requestData['request_data']['page'];
        }
        return $this->render('@frontend/modules/shop/views/default/category', $storesData);
    }


    /**
     * выдача данных товары
     * для получения из ajax
     */

    public function actionData()
    {
        //для запросов получить параметры запроса
        $requestData = ShopController::getRequestData([
            'vendor_id' => $this->vendor->id,
        ]);

        //return json_encode($requestData);

        $pagination = new Pagination(
            $requestData['query_db'],
            $requestData['cache_name'],
            [
                'limit' => $requestData['request_data']['query'] ? 48 : $requestData['request_data']['limit'],
                'page' => $requestData['request_data']['page'],
                'asArray'=> true
            ]
        );

        //$storesData['category'] = $requestData['request_data']['category'];
        $storesData['products'] = $pagination->data();
        $storesData["total_v"] = $pagination->count();
        $storesData["total_all_product"] = Product::activeCount();
        $storesData["page"] = empty($requestData['request_data']['page']) ? 1 : $requestData['request_data']['page'];
        $storesData["show_products"] = count($storesData['products']);
        $storesData["offset_products"] = $pagination->offset();
        $storesData["limit"] = empty($limit) ? Product::$defaultLimit : $limit;

        if ($pagination->pages() > 1) {
            $storesData["pagination"] = $pagination->getPagination($this->paginatePath, $requestData['paginate_params']);
            //$this->makePaginationTags($paginatePath, $pagination->pages(), $page, $paginateParams);
        }

        $storesData['favorites_ids'] = UsersFavorites::getUserFav(Yii::$app->user->id, true);

        return $this->renderAjax('@frontend/modules/shop/views/default/ajax/category', $storesData);
    }

}
