<?php

namespace console\controllers;

use common\models\Admitad;
use yii\console\Controller;
use yii\helpers\Console;
use frontend\modules\coupons\models\Coupons;
use Yii;

class TestController extends Controller
{

  /**
   * Тест Адмтада.
   */
  public function actionAdmitad()
  {
    $test=new Admitad();
    ddd($test->test());
  }

  /**
   * Тест почты. отправка письма на matuhinmax@mail.ru
   */
  public function actionMail()
  {
    try {
      Yii::$app
        ->mailer
        ->compose()
        ->setSubject('Тема сообщения')
        ->setTextBody('Текст сообщения')
        ->setHtmlBody('<b>текст сообщения в формате HTML</b>')
        ->setFrom([Yii::$app->params['adminEmail'] => Yii::$app->params['adminName']])
        ->setTo([
          'matuhinmax@mail.ru',
          'bnpparibas2011@mail.ru',
          'bnpparibas2011@gmail.com',
          'support@secretdiscounter.ru',
          'admin@secretdiscounter.com',
          'maxi_m_2016@mail.ru',
          'secretdiscounter.com@yandex.ru'
        ])
        ->setSubject(Yii::$app->name . ': Тест')
        ->send();
    } catch (\Exception $e) {
      ddd($e);
      echo  'error';
    }
  }
}