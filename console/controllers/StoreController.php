<?php

namespace console\controllers;

use yii\console\Controller;
use Yii;

class StoreController extends Controller
{

  public function actionIndex()
  {


    //$dir=realpath(dirname(__FILE__).'/../../').'/';
    //$fp = fopen($dir.'Store_'.date("Y_m_d_H:m:s").'.txt', 'w+');

    //fwrite($fp, date("Y_m_d_H:m:s")." Admitad\n");

    $tasks=[
        'doublertrade/offers'=> 'doublertrade',
        'admitad/store'=>'Admitad',
        'cj/stores'=>'Cj.com',
        'sellaction/store'=>'Sellaction',
        'performancehorizon/stores'=>'Performancehorizon',
        'linkconnector/stores'=>'linkconnector',
        'shareasale/store' => 'shareasale',
        'rakute/stores' => 'rakute',
        'awin/stores'=>'awin',
        'advertise/store' => 'advertise',
      //'travelpayouts/stores' => 'Travelpayouts', //нет API для получения шопов
        'webgains/stores' => 'Webgains',
    ];

    echo date("Y_m_d_H:m:s")." Start\n";
    foreach ($tasks as $task=>$name){
      echo date("Y_m_d_H:m:s")." Stores from $name\n";
      try {
        Yii::$app->runAction($task);
      } catch (Exception $e) {
        d($e->getMessage());
      } catch (yii\base\ErrorException $e){
        d($e->getMessage());
      }
      echo "\n";
    }

    echo date("Y_m_d_H:m:s")." END\n";

    //fwrite($fp, date("Y_m_d_H:m:s")." END\n");
    //fclose($fp);
  }
}