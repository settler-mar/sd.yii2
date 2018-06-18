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
    /*$client = new Rakute();
    $base=$client->getToken();
    $token="Bearer ".$base->access_token ;
    d($base);
    //$token=	"Bearer 7a7c51549dd5e65bbeb68e7b59ca2" ;*/
    $client = new Rakute();
    $parameters = [];
    $products = $client->productSearch($parameters);
    ddd($products);
  }

}