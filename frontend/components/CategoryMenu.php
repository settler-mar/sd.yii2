<?php

namespace frontend\components;

use yii\base\Widget;
use frontend\modules\category_stores\models\CategoryStores;


class CategoryMenu extends Widget
{

    public function init()
    {
        parent::init();
    }

    public function run()
    {
        $categoryId =
            !empty(\Yii::$app->controller->current_category_id) ? \Yii::$app->controller->current_category_id : null;
        return CategoryStores::tree(0, $categoryId);
    }
}