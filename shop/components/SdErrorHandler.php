<?php

namespace shop\components;

use yii\web\ErrorAction;
use frontend\models\DeletedPages;
use yii;

/**
 * Class SdErrorHandler
 * @package frontend\components
 */
class SdErrorHandler extends ErrorAction
{
  /**
   * @return string
   */
  public function run(){
    if ($this->getExceptionCode()==404) {
      Yii::$app->params['global_bg']='gray-box';
      Yii::$app->params['global_wrap']='page-404';
      Yii::$app->params['pre_footer_hide']=true;
    }
    return parent::run();
  }

};