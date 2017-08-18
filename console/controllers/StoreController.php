<?php

namespace console\controllers;

use console\models\Admitad;
use yii\console\Controller;
use Yii;

class StoreController extends Controller
{

  public function actionIndex(){
    $admitad = new Admitad();
    Yii::$app->balanceCalc->todo('58220,8,61777,4', 'cash');
ddd(2);

    ddd($admitad->getStore());
  }
}