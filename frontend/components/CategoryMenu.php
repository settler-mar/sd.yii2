<?php

namespace frontend\components;

use yii\base\Widget;
use frontend\modules\stores\models\CategoriesStores;


class CategoryMenu extends Widget
{
    public $show_hidden = true;//показывать ли в меню скрытые категории
    public $offline = null;//1 оффлайн, 0 online, null - все
    public $ext_items = '';//дополнителные пункты меню через запятую 'favorite,all_shops'
    public $as_array = false; //выводить ввиде массива
    public $where = false; //Where для запроса. Если задан то выборка только исходя их него

    public function init()
    {
        parent::init();
    }

    public function run()
    {
        $categoryId =
            !empty(\Yii::$app->controller->current_category_id) ?
                \Yii::$app->controller->current_category_id :
                null;
        return CategoriesStores::tree($categoryId, [
          'show_hidden' => $this->show_hidden,
          'offline' => $this->offline,
          'ext_items' => explode(',', $this->ext_items),
          'as_array' => $this->as_array,
          'where' => $this->where,
        ]);
    }
}