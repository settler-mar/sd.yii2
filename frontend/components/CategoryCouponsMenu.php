<?php

namespace frontend\components;

use yii;
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
          'name' => 'Все промокоды',
          'count' => Coupons::activeCount(),
          'route' => '',
          'uid' => 0
        ]];
        $categories = array_merge($categories, Coupons::getActiveCategoriesCoupons());
        $categories = array_merge($categories, [[
          'name' => 'Завершившиеся акции',
          'count' => Coupons::activeCount(true),
          'route' => 'expired',
          'uid' => -1
        ]]);
        $out = '<ul>';
        foreach ($categories as $category) {
            $out .= '<li>';

            if ($currentCategoryId != null && $category['uid'] == $currentCategoryId
                || $category['uid'] == 0 && Yii::$app->request->pathinfo == 'coupons'
                || $category['uid'] == -1 && Yii::$app->request->pathinfo == 'coupons/expired'
            ) {
                $class = 'class="active title"';
                //$classCount = 'class="active-count title"';
                $out .=  '<span ' . $class . '">' . $category['name'] . "&nbsp;(" .
                  $category['count'] . ")</span>";
            } else {
                $out .=  '<a href="/coupons' . ($category['route']? '/'.$category['route'] : '') .
                  '" class="title">' . $category['name'] .  '&nbsp;(' . $category['count'] .')</a>';
            }
            $out .='</li>';
        }
        $out .= '</ul>';
        return $out;
    }
}