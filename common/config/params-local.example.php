<?php
return [
  'adminEmail' => 'support@secretdiscounter.com', //почта от имени которой отправлять письма
  'adminName' => 'Secret Discounter', //имя от которого отправлять письма с сайта
  'supportEmail' => 'support@secretdiscounter.com', //сюда письма отправлются с формы поддержки
  'admitad'=>[
    'user' => '',
    'code' => '',
    'clientId'=>'',
    'clientSecret'=>'',
    'websiteId'=>'',
  ],
  'pays_update_period'=>1,
  'b2b_address' => '127.0.0.1:8080',
  'coupons_languages' => ['ru'],
  'coupons_languages_arrays' => [
    'ru' => ['ru', 'bg', 'sr', 'uk', 'mk'],//русский болгарский и т.д.
    'en' => ['en', 'la'],//английский латинский
  ],

  'outstand_cpa' => [
    'ozon' => [
      'parthnerId' => '',
      'login' => '',
      'affiliateId' => '',
      'password' => '',
    ],
    'booking.com' => [
    ],
  ],
];
