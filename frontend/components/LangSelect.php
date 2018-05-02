<?php
namespace frontend\components;

use yii\base\Widget;

class LangSelect extends Widget
{
  public function init()
  {
    parent::init();
  }

  public function run()
  {
    ddd(\Yii::$app->params['regions_list']);
    return "test";
  }
}
