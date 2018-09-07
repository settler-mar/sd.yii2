<?php

namespace common\models;

use yii;
/*
 * https://affiliate-program.amazon.com/gp/associates/apply/main.html
Заполните анкетку
 *
 *
 * https://affiliate-program.amazon.com/home/textlink/general?ac-ms-src=ac-nav
 * тут генерим ссылку на любую страницу. SUB ID Подставляем позже в linkId
 *
 * Токен берем тут
 * https://affiliate-program.amazon.com/assoc_credentials/home
 *
 * Статьи
 * https://www.patchesoft.com/amazon-affiliate-api-php
 * https://habr.com/post/151917/
 *
 * купил за 1.17 доллара книгу 6/09/2018 14:30
 */
class Amazon
{



  public function __construct()
  {
    //$config = Yii::$app->params['ebay'];

  }


  public function GetOrders($page = 1, $createTimeFrom = false) {

  }



}