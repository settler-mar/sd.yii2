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

    $categoryTree = ProductsCategory::tree([
        'counts' => true,
        'current' => $current,
        'empty' => false,
        'where' => ['active'=>[ProductsCategory::PRODUCT_CATEGORY_ACTIVE_YES]]
    ]);
    return $this->render('category_menu.twig', [
        'categories' => $categoryTree,
        'current' => $current,
    ]);

  }
}