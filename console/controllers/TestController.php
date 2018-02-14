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
    $test = new Admitad();
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
      echo 'error';
    }
  }

  /**
   * Тест получения платежа
   */
  public function actionPayment()
  {
    $params = [
        'limit' => 500,
        'offset' => 0,
      //'subid'=>68650,
    ];

    $t = 1518471732;
    $d = 100;

    $params['status_updated_start'] = date('d.m.Y H:i:s', $t - $d);
    $params['status_updated_end'] = date('d.m.Y H:i:s', $t + $d);

    d($params);

    $admitad = new Admitad();
    $payments = $admitad->getPayments($params);
    if ($payments) {
      d($payments['_meta']);
      if (isset($payments['results']) && isset($payments['results'][0])) {
        d($payments['results'][0]);
      }
    }
  }
}