<?php

namespace console\controllers;

use yii\console\Controller;
use Yii;

class StoreController extends Controller
{

  public function actionIndex()
  {
    Yii::$app->runAction('admitad/store');
  }
}