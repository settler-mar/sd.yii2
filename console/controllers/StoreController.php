<?php

namespace console\controllers;

use yii\console\Controller;
use Yii;

class StoreController extends Controller
{

  public function actionIndex()
  {
    Yii::$app->runAction('admitad/store');
    Yii::$app->runAction('doublertrade/offers');
    Yii::$app->runAction('cj/stores');
    Yii::$app->runAction('sellaction/store');
    Yii::$app->runAction('performancehorizon/stores');
  }
}