<?php

namespace console\controllers;

use console\models\Admitad;
use yii\console\Controller;
use Yii;

class StoreController extends Controller
{

  public function actionIndex(){
    $admitad = new Admitad();
    $params = [
      'limit' => 500,
      'offset' => 0,
      'connection_status' => 'active',
    ];

    $stores=$admitad->getStore($params);
    while ($stores) {
      d($stores['_meta']);


      $params['offset'] = $stores['_meta']['limit'] + $stores['_meta']['offset'];
      if ($params['offset'] < $stores['_meta']['count']) {
        $stores = $admitad->getStore($params);
      } else {
        break;
      }
    }
  }
}