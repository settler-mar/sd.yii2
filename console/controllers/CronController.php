<?php

namespace console\controllers;

use console\models\Admitad;
use yii\console\Controller;
use yii\helpers\Console;
use frontend\modules\coupons\models\Coupons;

class CronController extends Controller
{
  /**
   * Выводит список имеюхщихся команд.
   */
  public function actionIndex()
  {
    echo '- '.$this->ansiFormat('cron', Console::FG_YELLOW)."\n";
    echo "    ".$this->ansiFormat('cron/refresh', Console::FG_GREEN);
    echo "     Обновить статус посылок (10 штук)\n";
    echo "    ".$this->ansiFormat('cron/exchange', Console::FG_GREEN);
    echo "    Обновить курс cad/usd\n";
  }

  /**
   * Уаляет старые купоны.
   */
  public function actionDeleteOldCoupons()
  {
    echo '- '.$this->ansiFormat('cron', Console::FG_YELLOW)."\n";
    echo "    ".$this->ansiFormat('cron/refresh', Console::FG_GREEN);
    echo "     Обновить статус посылок (10 штук)\n";
    echo "    ".$this->ansiFormat('cron/exchange', Console::FG_GREEN);
    echo "    Обновить курс cad/usd\n";
  }

  /**
   * Тест Адмтада.
   */
  public function actionTestAdmitad()
  {
    $test=new Admitad();
    ddd($test->test());
  }

  /**
   * .
   */
  public function actionPaymentsUpdate()
  {
    $test=new Admitad();
    ddd($test->getPayments());
  }

  /**
   * ОБновление базы данных купонов
   *
   */
  public function actionCouponsInsert(){
    $coupons=new Admitad();
    $params=[
      'keyword' => '',
      'region' => '00',
      'only_my' => 'on',
      'v' => 1,
      'limit'=>2,
    ];

    $categories = [];
    $coupons=$coupons->getCupons($params);

    foreach ($coupons['results'] as $coupon){
      $coupon_categories=[];
      $db_coupons=Coupons::findOne(['coupon_id'=>$coupon['id']]);

      //Проверяем что б купон был новый
      if(!$db_coupons){
        //Добавляем категорию в базу
        foreach ($coupon['categories'] as $k=>$categorie) {
          $categories[$categorie['id']]=$categorie['name'];
          $coupon_categories[$categorie['id']]=$categorie['name'];
        }


      };
      //d($coupon['categories']);
      //$categories[]
    }

    ddd($categories);
  }
}