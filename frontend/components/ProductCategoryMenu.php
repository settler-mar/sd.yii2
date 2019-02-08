<?php

namespace frontend\components;

use yii\base\Widget;
use yii;
use frontend\modules\product\models\ProductsCategory;


class ProductCategoryMenu extends Widget
{
    public $show_hidden = true;//показывать ли в меню скрытые категории
    public $where = false; //Where для запроса. Если задан то выборка только исходя их него
    public $vendor = false;

    public function init()
    {
        parent::init();
    }

    public function getViewPath()
    {
        return \Yii::getAlias('@frontend/views/components');
    }

    public function run()
    {
        $current = isset(Yii::$app->controller->category) && Yii::$app->controller->category ?
            Yii::$app->controller->category->id : false;
        $language = Yii::$app->language == Yii::$app->params['base_lang'] ? false : Yii::$app->language;
        $cacheName = 'product_category_menu' . ($current ? '_' . $current : '') . ($language ? '_'.$language : '');
        $dependency = new yii\caching\DbDependency;
        $dependencyName = 'catalog_product';
        $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $dependencyName . '"';

        $cache = Yii::$app->cache;
        $out = $cache->getOrSet($cacheName, function () use ($current) {
            $categoryTree = ProductsCategory::tree([
                'counts' => true,
                'current' => $current,
                'empty' => false,
                'where' => [
                    'pc.active' => [ProductsCategory::PRODUCT_CATEGORY_ACTIVE_YES],
                    's.is_active' => [0, 1],//шоп активен
                ],
                'regions' => 1,//количество товаров текущего региона
            ]);
            return $this->render('category_menu.twig', [
                'categories' => $categoryTree,
                'current' => $current,
            ]);
        }, $cache->defaultDuration, $dependency);

        return $out;
    }
}