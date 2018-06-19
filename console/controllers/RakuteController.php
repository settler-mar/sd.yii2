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
    //d($merchants=$client->merchantList());
    //$mid=$merchants[0]->midlist[0]->merchant[0]->mid;

    $mid=40842;
    $merchant=$client->getMerchByID($mid);
    ddd($merchant);
  }

}