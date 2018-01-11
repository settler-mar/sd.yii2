<?php

namespace frontend\components;

use yii\base\Widget;
use frontend\modules\stores\models\CategoriesStores;


class CategoryMenu extends Widget
{
    public $show_hidden = true;//показывать ли в меню скрытые категории
    public $online = null;//1 онлайн, 0 оффлайн
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
          'online' => $this->online,
          'ext_items' => explode(',', $this->ext_items),
          'as_array' => $this->as_array,
          'where' => $this->where,
        ]);
    }
}