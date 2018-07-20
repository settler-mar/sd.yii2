<?php

namespace console\controllers;

use common\models\Admitad;
use common\models\Travelpayouts;
use common\models\Advertise;
use yii\console\Controller;
use yii\helpers\Console;
use frontend\modules\coupons\models\Coupons;
use Yii;
use frontend\modules\actions\models\ActionsActions;

class TestController extends Controller
{
    public function beforeAction($action)
    {
        if (Console::isRunningOnWindows()) {
            shell_exec('chcp 65001');
        }
        return parent::beforeAction($action);
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

  public function actionActionObserver()
  {
      ActionsActions::observeActions([62053]);
  }

  public function actionTravelpayouts()
  {
      $service = new Travelpayouts();
      ddd($service->getPeyments());
      //ddd($service->getCompaings());
  }

  public function actionAdvertice()
  {
      $service = new Advertise();
      ddd($service->test()) ;

  }

  public function actionApi()
  {
      $cache = Yii::$app->cache;
      $token = $cache->getOrSet('sdapi_access_token', function () {
          $url = 'sdapi/oauth2/default/token';
          $params = [
              'grant_type'=> 'password',
              'username'=>'someuser',
              'password'=> 'somepass',
              'client_id'=>'testclient',
              'client_secret'=>'testpass'
          ];
          $params = http_build_query($params);


          $ch = curl_init();
          curl_setopt($ch, CURLOPT_URL, $url);
          curl_setopt($ch, CURLOPT_POST, 1);
          curl_setopt($ch, CURLOPT_POSTFIELDS, $params);
          curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
          $response = curl_exec($ch);
          $errno = curl_errno($ch);
          if ($errno !== 0) {
              d(sprintf("Error connecting to Api request token: [%s] %s ", $errno, curl_error($ch)), $errno);
          }
          curl_close($ch);
          d($response);
          $token = json_decode($response, true);
          if (isset($token['access_token'])) {
              return $token;
          } else return false;
      });
      d($token);
      if ($token && isset($token['access_token'])) {
          $url = 'sdapi/stores';
          $params = [
              'access-token'=> $token['access_token'],
          ];
          $params = http_build_query($params);
          $url .= '?' . $params;
          d($url);
          $ch = curl_init();
          curl_setopt($ch, CURLOPT_URL, $url);
          curl_setopt($ch, CURLOPT_POST, 0);
          curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
          $response = curl_exec($ch);
          $errno = curl_errno($ch);
          if ($errno !== 0) {
              d(sprintf("Error connecting to Api request data: [%s] %s ", $errno, curl_error($ch)), $errno);
          }
          curl_close($ch);
          ddd($response);
      }


  }


}