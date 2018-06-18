<?php

namespace console\controllers;

use common\components\Help;
use common\models\Rakute;
use Yii;
use yii\console\Controller;

class RakuteController extends Controller
{

  public function actionProduct()
  {
    $client = new Rakute();
    d($client->merchantList());
    $products = $client->test([
        "limit"=>1000,
        "page"=>1,
    ]);
    ddd($products);
  }

}