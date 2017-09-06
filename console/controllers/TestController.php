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
    Yii::$app
      ->mailer
      ->compose()
      ->setSubject('Тема сообщения')
      ->setTextBody('Текст сообщения')
      ->setHtmlBody('<b>текст сообщения в формате HTML</b>')
      ->setFrom([Yii::$app->params['supportEmail'] => Yii::$app->params['supportEmail']])
      ->setTo('matuhinmax@mail.ru')
      ->setSubject(Yii::$app->name . ': Тест')
      ->send();
  }
}