<?php

namespace frontend\components\socials;

use yii\base\Widget;

class EauthWidget extends Widget
{
  public $vertical = false;
  
  public function run()
  {
    //return \nodge\eauth\Widget::widget(['action' => '/socials/login']);
    return NodgeWidget::widget(['action' => '/socials/login', 'vertical' => $this->vertical]);
  }
}