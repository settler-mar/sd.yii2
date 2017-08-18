<?php

namespace console\controllers;

use console\models\Admitad;
use yii\console\Controller;
use yii\helpers\Console;
use frontend\modules\coupons\models\Coupons;

class AdmitadController extends Controller
{

  /**
   * Тест Адмтада.
   */
  public function actionTest()
  {
    $test=new Admitad();
    ddd($test->test());
  }
}