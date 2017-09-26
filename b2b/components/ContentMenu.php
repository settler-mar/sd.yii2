<?php

namespace b2b\components;

use yii\base\Widget;
use frontend\modules\b2b_content\models\B2bContent;


class ContentMenu extends Widget
{
  public $wrapper_class = 'content_menu';
  public $list_class = 'content_menu__list';
  public $item_class = 'content_menu__item';
  public $link_class = 'content_menu__link';
  public $current_item_class = 'current';
  public $current_item = '';//текущий пункт (title)
  public $is_guests = false;//юсер незарегистрирован

  public function init()
  {
    parent::init();
  }

  public function run()
  {
    $list = B2bContent::menu($this->is_guests);
    if (count($list) == 0) {
      return null;
    }
    $items = '';
    foreach ($list as $item) {
      $items .= '<li class="'.$this->list_class .
        ($this->current_item == $item['title'] ? ' '.$this->current_item_class : '').
        '"><a class="'.$this->link_class.'" href="/'.$item['page'].'">'.$item['title'].'</a></li>';
    }
    return '<div class="'.$this->wrapper_class.'"><ul class="'.$this->item_class.'">'.$items.'</ul></div>';
  }
}