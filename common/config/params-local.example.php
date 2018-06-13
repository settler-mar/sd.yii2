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
  'shareasale'=> [
    'affiliateID' => '',
    'APIToken' => "",
    'APISecretKey' => "",
  ],
  'sellaction' => [
    'id' => '100025598',
    'apiKey' => '5lPEoGZ1tsdWHO8Af6lLO9dQZmLaitoK',
    'siteId' => '13779',// id площадки
    'categories_json' => '/common/config/json/sellaction_categories.json'
  ],
  'ebay' => [
    'AppID' => 'SecretDi-SecretDi-PRD-5668815a4-f1ea0df8',
    'DevID' => '7643d5f3-42ce-43cf-97d5-59bee643bca0',
    'CertID'  => 'PRD-668815a4ebe3-4844-412a-993f-456f',
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
          'route' => 'ozon.ru'//??
      ],
      'booking.com' => [
          'route' => 'booking-com',
          'file_loader' => [
              //of frontend/modules/stores/models/FileImport
              'method' => 'booking',

          ],
      ],
  ],
];
