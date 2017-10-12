<?php

namespace frontend\components;

use yii\base\Widget;
use frontend\modules\coupons\models\Coupons;


class CategoryCouponsMenu extends Widget
{
    public function init()
    {
        parent::init();
    }

    public function run()
    {
        $currentCategoryId = !empty(\Yii::$app->controller->current_coupon_category_id) ?
              \Yii::$app->controller->current_coupon_category_id : null;
        $categories = [[
          'name' => 'Все купоны',
          'count' => Coupons::activeCount(),
          'route' => '',
          'uid' => 0
        ]];
        $categories = array_merge($categories, Coupons::getActiveCategoriesCoupons());
        $out = '<ul data-mcs-theme="dark">';
        foreach ($categories as $category) {
            $out .= '<li>';

            if ($currentCategoryId != null && $category['uid'] == $currentCategoryId) {
                $class = 'class="active title"';
                $classCount = 'class="active-count title"';
                $out .=  '<span ' . $class . '">' . $category['name'] . "</span> <span ".$classCount.">(" .
                  $category['count'] . ")</span>";
            } else {
                $out .=  '<a href="/coupons' . ($category['route']? '/'.$category['route'] : '') .
                  '" class="title">' . $category['name'] .  ' <span>(' . $category['count'] .')</span></a>';
            }
            $out .='</li>';
        }
        $out .= '</ul>';
        //ddd($out);
        return $out;
    }
}