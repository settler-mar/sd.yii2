<?php
$currencyIcon = [
  'RUB' => '<span class="fa fa-rub"></span>',
  'EUR' => '<span class="fa fa-eur"></span>',
  'USD' =>'<span class="fa fa-dollar"></span>',
  'UAH' => '<span class="uah">&#8372;</span>',
  'KZT' => '<span class="uah">&#8376;</span>',
];

$functionsList=[
  //вывод одного элемента меню врутри <li> ... </li>
  'get_menu_item'=>function ($item) {
    $httpQurey =  $_SERVER['REQUEST_URI'];
    if (!count($item)) {
      return null;
    }
    return '<a class="'.(empty($item['class']) ? '' : $item['class'] ).
    (($httpQurey == $item['href'])? ' active' : '').'" '
    .(($httpQurey == $item['href'])? '' : 'href="'.$item['href'].'"') .'>'.
    $item['title'] . '</a>';
  },
  //функция or - вывод первого непустого аргумента
  '_or'=> function () {
    if (!func_num_args()) {
      return null;
    }
    foreach (func_get_args() as $arg) {
      if (!empty($arg)) {
        return $arg;
      }
    }
    return null;
  },
  //функция убрать <br> из контента
  '_no_br'=> function ($content) {
    return str_replace('<br>', '', $content);
  },
  /*//функция отдать константу по имени
  '_constant'=> function ($name) {
    $constant = new \Cwcashback\Handling\Constants;
    return $constant->get($name);
  },*/
  //функция - вывести кешбек  и валюту, если не задан процента кешбека для шопа
  '_cashback'=> function ($cashback, $currency) {
    return $cashback . ((strpos($cashback, '%') === false) ? ' ' . $currency : '');
  },
  //функция - вывести кэшбек шопа в списках если нулевой, то сердечки
  '_shop_cashback'=> function ($cashback, $currency) {
    $value = preg_replace("/[^0-9]/", '', $cashback);
    if (intval($value) == 0) {
      return '<i class="red fa fa-heart"></i>';
    } elseif (strpos($cashback, '%') === false) {
      return $cashback . ' ' .
      (isset($currencyIcon[$currency]) ? $currencyIcon[$currency] : $currency);
    } else {
      return $cashback;
    }
  }
];

return $functionsList;