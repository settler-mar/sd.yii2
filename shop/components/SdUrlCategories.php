<?php
namespace shop\components;

use yii;
use yii\web\UrlRuleInterface;
use shop\modules\category\models\ProductsCategory;


class SdUrlCategories implements UrlRuleInterface{

  public function parseRequest($manager, $request)
  {

    $path = explode('/',$request->pathInfo);
    if (count($path) > 1 && $path[0] =='category') {
        $category = ProductsCategory::byRoute(array_slice($path, 1));
        //нашли категорию
        if ($category) {
            Yii::$app->params['catalog_category'] = $category;
            $request->pathinfo = 'category';
            $params = explode('?', $request->url);
            $request->url = '/category' . (isset($params[1]) ?  '?' . $params[1] : '');
        }
    }
    return false;
  }

    public function createUrl($manager, $route, $params)
  {
    return false;
  }
}