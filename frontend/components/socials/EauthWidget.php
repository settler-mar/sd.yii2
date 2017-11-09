<?php

namespace frontend\components\socials;

use yii\base\Widget;

class EauthWidget extends Widget
{
  public function run()
  {
    return \nodge\eauth\Widget::widget(['action' => '/socials/login']);
  }
}