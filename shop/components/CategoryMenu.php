<?php

namespace shop\components;

use yii\base\Widget;
use yii;
use shop\modules\category\models\ProductsCategory;


class CategoryMenu extends Widget
{
  public $show_hidden = true;//показывать ли в меню скрытые категории
  public $where = false; //Where для запроса. Если задан то выборка только исходя их него

  public function init()
  {
    parent::init();
  }

  public function getViewPath()
  {
    return \Yii::getAlias('@shop/views/components');
  }

  public function run()
  {
    $current = isset(Yii::$app->controller->category) && Yii::$app->controller->category ?
        Yii::$app->controller->category->id : false;

    $cache = Yii::$app->cache;
    $out = $cache->getOrSet('product_category_menu', function () use ($current) {
        $categoryTree = ProductsCategory::tree(['counts' => true, 'current' => $current, 'empty' => false]);
        return $this->render('category_menu.twig', [
            'categories' => $categoryTree,
            'level' => '0'
        ]);
    });
    return $out;

  }
}