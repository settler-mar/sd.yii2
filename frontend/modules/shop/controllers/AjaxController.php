<?php

namespace frontend\modules\shop\controllers;

use frontend\components\SdController;
use Yii;

class AjaxController extends SdController
{

  private $cache;
  private $region;
  private $lang;

  public function beforeAction($action) {
    $this->enableCsrfValidation = false;
    return parent::beforeAction($action);
  }

  public function createAction($id)
  {
    $request = Yii::$app->request;

    $this->cache = Yii::$app->cache_shop;
    $this->region = Yii::$app->params['region'];
    $this->lang = Yii::$app->params['lang_code']=='ru' ? false : Yii::$app->params['lang_code'];

    if (!$request->isAjax) {
      //throw new \yii\web\NotFoundHttpException();
    }
    return parent::createAction($id);
  }

  public function actionMenu()
  {
    $data_tree = $this->cache->get('products_category_route_region_' . $this->region);
    $data_list = $this->cache->get('products_category_region_' . $this->region);
    $data = $this->buildTree($data_tree, $data_list);

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
}