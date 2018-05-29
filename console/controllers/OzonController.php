<?php

namespace console\controllers;

use common\models\Ozon;
use yii\console\Controller;
use yii\helpers\Console;
use Yii;

class OzonController extends Controller
{

 public function actionOrders()
  {
      $ozon  = new Ozon();
      $stat = $ozon->getOrders(time() - 60 * 60 * 24 * 30);
      ddd($stat);
  }
}