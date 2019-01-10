<?php

namespace frontend\components;

use yii;
use yii\base\Widget;
use frontend\modules\coupons\models\Coupons;
use common\components\Help;


class CategoryCouponsMenu extends Widget
{
    public $search_item = false;
    public $where = [];
    public $out_address;//внешняя ссылка

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
                'name' => Yii::t('main','stores_menu_abc'),
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
            'name' => Yii::t('main', 'coupons_menu_new'),
            'count' => Coupons::activeCount('new'),
            'route' => 'new',
            'uid' => -4,
            'class' => 'cat_news',
        ];

        $categories = array_merge($categories, Coupons::getActiveCategoriesCoupons($this->where));
//        $categories = array_merge($categories, [[
//          'name' => 'Завершившиеся акции',
//          'count' => Coupons::activeCount('expired'),
//          'route' => 'expired',
//          'uid' => -1
//        ]]);
        $categories = array_merge($categories, [[
            'name' => Yii::t('main', 'coupons_menu_all'),
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
                //$lg = Yii::$app->params['lang_code'];
                //$href = ($lg == 'ru'  ? '' : '/'.$lg) .'/coupons' . ($category['route']? '/'.$category['route'] : '');
                $href = Help::href('/coupons' . ($category['route']? '/'.$category['route'] : ''), $this->out_address);
                $out .=  '<a href="'.$href.
                    '" class="title'.(isset($category['class']) ? ' '.($category['class']) : '').'"'.
                    ($this->out_address ? ' target="_blank" rel="nooper nofollow noreferrer"' : '').
                    '>' .
                    $category['name'] .($category['count'] !== null ?  '&nbsp;(' . $category['count'] .')' : '') .
                    '</a>';
            }
            $out .='</li>';
        }
        $out .= '</ul>';
        return $out;
    }
}