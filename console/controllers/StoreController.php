<?php

namespace console\controllers;

use yii\console\Controller;
use Yii;

class StoreController extends Controller
{

  public function actionIndex()
  {
    $dir=realpath(dirname(__FILE__).'/../../').'/';
    $fp = fopen($dir.'Store_'.date("Y_m_d_H:m:s").'.txt', 'w+');

    fwrite($fp, date("Y_m_d_H:m:s")." Admitad\n");
    echo "\nStores Admitad\n";
    Yii::$app->runAction('admitad/store');

    fwrite($fp, date("Y_m_d_H:m:s")." doublertrade\n");
    echo "\nStores doublertrade\n";
    Yii::$app->runAction('doublertrade/offers');

    fwrite($fp, date("Y_m_d_H:m:s")." cj\n");
    echo "\nStores CJ\n";
    Yii::$app->runAction('cj/stores');

    fwrite($fp, date("Y_m_d_H:m:s")." sellaction\n");
    echo "\nStores and Coupons sellaction\n";
    Yii::$app->runAction('sellaction/store');

    fwrite($fp, date("Y_m_d_H:m:s")." performancehorizon\n");
    echo "\nStores performancehorizon\n";
    Yii::$app->runAction('performancehorizon/stores');

    fwrite($fp, date("Y_m_d_H:m:s")." linkconnector\n");
    echo "\nStores linkconnector\n";
    Yii::$app->runAction('linkconnector/stores');

    fwrite($fp, date("Y_m_d_H:m:s")." shareasale\n");
    echo "\nStores shareasale\n";
    Yii::$app->runAction('shareasale/store');

    fwrite($fp, date("Y_m_d_H:m:s")." rakute\n");
    echo "\nStores rakute\n";
    Yii::$app->runAction('rakute/stores');

    fwrite($fp, date("Y_m_d_H:m:s")." awin\n");
    echo "\nStores awin\n";
    Yii::$app->runAction('awin/stores');

    fwrite($fp, date("Y_m_d_H:m:s")." advertise\n");
    echo "\nStores advertise\n";
    Yii::$app->runAction('advertise/store');

    fwrite($fp, date("Y_m_d_H:m:s")." webgains\n");
    echo "\nStores Webgains\n";
    Yii::$app->runAction('webgains/stores');

    fwrite($fp, date("Y_m_d_H:m:s")." END\n");
    fclose($fp);
  }
}