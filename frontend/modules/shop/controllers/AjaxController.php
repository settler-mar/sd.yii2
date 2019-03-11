<?php

namespace frontend\modules\shop\controllers;

use frontend\components\SdController;
use Yii;

class AjaxController extends SdController
{

  private $cache;
  private $region;
  private $lang;

  public function createAction($id)
  {
    $request = Yii::$app->request;

    $this->cache = Yii::$app->cache_shop;
    $this->region = Yii::$app->params['region'];
    $this->lang = Yii::$app->params['regions_list'][$this->region]['langDefault'] == Yii::$app->params['lang_code'] ?
        false : Yii::$app->params['lang_code'];

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
    ddd($data_tree, $data_list, $data);
    return 1;
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

      unset($store['children_ids']);
      unset($store['price_min']);
      unset($store['price_max']);
      unset($store['vendor_list']);
      unset($store['stores_list']);
      unset($store['children']);

      if (!empty($item['children'])) {
        $store['children'] = $this->buildTree($item['children'], $data_list);
      }
      $out[] = $store;

    }

    return $out;
  }
}