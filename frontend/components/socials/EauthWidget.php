<?php

namespace frontend\components\socials;

//use yii\base\Widget;
//use yii\web\View;
//use yii;

class EauthWidget extends \nodge\eauth\Widget
{
  public $vertical = false;

//  public function run()
//  {
//    return \nodge\eauth\Widget::widget(['action' => '/socials/login']);
//  }

  public function run()
  {
    $js = false;
    if ($this->popup) {
      $options = [];
      foreach ($this->services as $name => $service) {
        $options[$service->id] = $service->jsArguments;
      }
      //$js = 'jQuery("#' . $this->getId() . '").eauth(' . json_encode($options) . ');';
      $js = 'jQuery(".sd-eauth").eauth(' . json_encode($options) . ');';
    }

    echo $this->render('/widgets/socials', [
      'id' => $this->getId(),
      'services' => $this->services,
      'action' => 'login/socials',
      'popup' => $this->popup,
      'assetBundle' => $this->assetBundle,
      'vertical' => $this->vertical,
      'js' => $js,
    ]);
  }
}