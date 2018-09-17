<?php

namespace frontend\components\socials;

//use yii\base\Widget;
//use yii\web\View;
//use yii;

use frontend\modules\constants\models\Constants;

class EauthWidget extends \nodge\eauth\Widget
{
  public $vertical = false;
  public $float = false;

//  public function run()
//  {
//    return \nodge\eauth\Widget::widget(['action' => '/socials/login']);
//  }

  public function run()
  {
    $js = false;
    if ($this->popup) {
      $options = [];
      /*foreach ($this->services as $name => $service) {
        $options[$service->id] = $service->jsArguments;
      }*/
      //$js = 'jQuery("#' . $this->getId() . '").eauth(' . json_encode($options) . ');';

      $js = 'obj=jQuery(".sd-eauth");if(obj.eauth){obj.eauth(' . json_encode($options) . ');}';
    }

    $service = Constants::byName('social_auth');


    $dop_class='';
    if($this->float){
      $dop_class.=' float_'.$this->float;
    }
    echo $this->render('@app/views/widgets/socials', [
      'id' => $this->getId(),
      //'services' => $this->services,
      'services' => $service['text'],
      'action' => [
          'nodge'=>'login/socials?service=',
          'yii' =>'socials-auth?authclient=',
        ],
      'replace'=>[
          'nodge'=>[
              'google'=>'google_oauth',
          ],
          'yii'=>[

          ]
      ],
      'popup' => $this->popup,
      'assetBundle' => $this->assetBundle,
      'vertical' => $this->vertical,
      'js' => $js,
      'dop_class'=>$dop_class,
      'region'=>  \Yii::$app->params['region'],
    ]);
  }
}