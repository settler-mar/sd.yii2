<?php

namespace console\controllers;

use yii\console\Controller;
use Yii;

class StoreController extends Controller
{

  public function actionIndex()
  {
    d(time());

    echo "\nStores Admitad\n";
    Yii::$app->runAction('admitad/store');

    echo "\nStores doublertrade\n";
    Yii::$app->runAction('doublertrade/offers');

    echo "\nStores CJ\n";
    Yii::$app->runAction('cj/stores');

    echo "\nStores and Coupons sellaction\n";
    Yii::$app->runAction('sellaction/store');

    echo "\nStores performancehorizon\n";
    Yii::$app->runAction('performancehorizon/stores');

    echo "\nStores linkconnector\n";
    Yii::$app->runAction('linkconnector/stores');

    echo "\nStores shareasale\n";
    Yii::$app->runAction('shareasale/store');

    echo "\nStores rakute\n";
    Yii::$app->runAction('rakute/stores');


  }
}