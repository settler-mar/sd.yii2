<?php

namespace console\controllers;

use common\models\Admitad;
use common\models\Travelpayouts;
use common\models\Advertise;
use common\models\SdApi;
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
    ddd($service->test());

  }

  public function actionApiStores()
  {
    $service = new SdApi("USER_ID", "USER_SECRET");
    $page = 1;
    $onPage = 100;
    $count = $onPage;
    do {
      //в цикле делаем запросы
      $response = $service->getStores($page, $onPage);

      if ($page == 1 && isset($response['meta'])) {
        echo print_r($response['meta']) . "\n";
      }
      echo "Page " . $page . "\n";

      $page = isset($response['meta']['page']) ? $response['meta']['page'] : $page;
      $count = isset($response['meta']['count']) ? $response['meta']['count'] : $count;
      $pageCount = ceil($count / $onPage);

      if (isset($response['stores'])) {

        foreach ($response['stores'] as $store) {
          //цикл по полученным шопам
          echo print_r($store, true) . "\n";
          //что-то делаем с шопом

        }
      }

      $page++;
      //пока не прошли все страницы
    } while ($page <= $pageCount);

  }

  public function actionApiPayments()
  {
    $service = new SdApi("USER_ID", "USER_SECRET");
    $page = 1;
    $onPage = 100;
    $count = $onPage;
    $dateFrom = date('Y-m-d H:i:s', time() - 60 * 60 * 24 * 90);//за последние 3 месяца

    do {
      //в цикле делаем запросы
      $response = $service->getPayments($page, $onPage, $dateFrom);

      if ($page == 1 && isset($response['meta'])) {
        echo print_r($response['meta']) . "\n";
      }
      echo "Page " . $page . "\n";

      $page = isset($response['meta']['page']) ? $response['meta']['page'] : $page;
      $count = isset($response['meta']['count']) ? $response['meta']['count'] : $count;
      $pageCount = ceil($count / $onPage);

      if (isset($response['payments'])) {

        foreach ($response['payments'] as $payment) {
          //цикл по полученным платежам
          echo print_r($payment, true) . "\n";
          //что-то делаем с платежом

        }
      }

      $page++;
      //пока не прошли все страницы
    } while ($page <= $pageCount);

  }


}