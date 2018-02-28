<?php

namespace frontend\components;

use yii;
use yii\base\Widget;
use frontend\modules\coupons\models\Coupons;


class CategoryCouponsMenu extends Widget
{
    public $search_item = false;

    public function init()
    {
        parent::init();
    }

    public function run()
    {
        $currentCategoryId = !empty(\Yii::$app->controller->current_coupon_category_id) ?
              \Yii::$app->controller->current_coupon_category_id : null;
//        $categories = [[
//          'name' => 'Все промокоды',
//          'count' => Coupons::activeCount(),
//          'route' => '',
//          'uid' => 0
//        ]];
        if ($this->search_item) {
            $categories[] = [
                'name' => 'АЛФАВИТНЫЙ ПОИСК',
                'count' => null,
                'route' => 'abc',
                'uid' => -2,
                'class' => 'cat_bold'
            ];
        }
        $categories[] = [
            'name' => 'Top-50',
            'count' => null,
            'route' => 'top',
            'uid' => -3,
            'class' => 'cat_promo'
        ];
        $categories[] = [
            'name' => 'Новые промокоды',
            'count' => Coupons::activeCount('new'),
            'route' => 'new',
            'uid' => -4,
            'class' => 'cat_news',
        ];

        $categories = array_merge($categories, Coupons::getActiveCategoriesCoupons());
//        $categories = array_merge($categories, [[
//          'name' => 'Завершившиеся акции',
//          'count' => Coupons::activeCount('expired'),
//          'route' => 'expired',
//          'uid' => -1
//        ]]);
        $categories = array_merge($categories, [[
            'name' => 'Все промокоды',
            'count' => Coupons::activeCount(),
            'route' => '',
            'uid' => 0,
            'class' => 'cat_bold cat_upper all_shops'
        ]]);
        $out = '<ul>';
        foreach ($categories as $category) {
            $out .= '<li '.(isset($category['class']) ? ' class="'.($category['class']).'"' : '').'>';

            if ($currentCategoryId != null && $category['uid'] == $currentCategoryId
                || $category['uid'] == 0 && Yii::$app->request->pathinfo == 'coupons'
                || $category['uid'] == -1 && Yii::$app->request->pathinfo == 'coupons/expired'
                || $category['uid'] == -2 && Yii::$app->request->pathinfo == 'coupons/abc'
                || $category['uid'] == -3 && Yii::$app->request->pathinfo == 'coupons/top'
                || $category['uid'] == -4 && Yii::$app->request->pathinfo == 'coupons/new'
            ) {
                $class = 'class="active title'.(isset($category['class']) ? ' '.($category['class']) : '').'"';
                //$classCount = 'class="active-count title"';
                $out .=  '<span ' . $class . '">' . $category['name'] .
                    ($category['count'] !== null? "&nbsp;(" .  $category['count'] . ")" : "")."</span>";
            } else {
                $out .=  '<a href="/coupons' . ($category['route']? '/'.$category['route'] : '') .
                  '" class="title'.(isset($category['class']) ? ' '.($category['class']) : '').'">' . $category['name'] .($category['count'] !== null ?  '&nbsp;(' . $category['count'] .')' : '').'</a>';
            }
            $out .='</li>';
        }
        $out .= '</ul>';
        return $out;
    }
}