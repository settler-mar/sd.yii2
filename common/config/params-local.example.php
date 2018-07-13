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
  'rakute' => [
      'basic_token'=>"X3NtVkpISWZmVkpaVklPUkN5RVU5bkhrak5vYTpEcTBaZnQ3V0pnS2U2eVVEdlhuUlZZcDFrcFFh",
      "username" => "versus",
      'password'=>'2011odnNN',
      'scope'=>'3307423',
      'categories_json' => '/common/config/json/rakute_categories.json',
      'oid' => 419234,
      'site_id' => 'PyKfoj8cbJ4',
  ],
  'cj.com' => [
      'site_id' => '8021356',
      'dev_key' => '00bcee2d8efac83743ed7c0abcbb764e0ad1194c3f2db2ab326453e22fcc3aed8379e7d1e0572e49054eeb155c1710061b42a83f118f3889379e386add0ee2555b/0099d74407ba139054e2ab6fbed0d2fba7792ea55488ac8514aa7757a5de2259c59fc5cb63354bd629e0a9fd4adbd9b11711c8de6d7dc224f6c79573e16c5113f1',
  ],
  'doublertrade' => [
    'affiliateId' => 3044873,
    'reportKey' => '7b07b59a606f6349e64c100aff74d413',
    'tokenProducts' => 'F37CF4D9328741C32097539AA4E02D346BE0BEB6',
    'tokenVouchers' => '761C55597D6FFEA524A4AAFFE7E6D93A4F3DBD55',
    'tokenPublisherVouchers' => '7EB9463BF01D9535478B61CE81404D1CFFE2C0F8',
    'tokenConversions' => '4972CD3B8619F74F419B703CF878E10681C1BB0A',
  ],
  'advertise' => [
    'user_id' => 14372,
    'token' => '3f9f65d171af1ef1563da373e1566df2',
  ],
  'ebay' => [ //sandbox
      'AppID' => 'SecretDi-SecretDi-SBX-7c970d9ce-7cfe4b52',
      'DevID' => '7643d5f3-42ce-43cf-97d5-59bee643bca0',
      'CertID'  => 'SBX-c970d9ce75e4-201d-4ed2-a0de-8492',
      'ProjectName' => 'Secret Discounter Api',
      'token' => 'AgAAAA**AQAAAA**aAAAAA**aXMhWw**nY+sHZ2PrBmdj6wVnY+sEZ2PrA2dj6ABmYOgAZKCpgqdj6x9nY+seQ**wGIEAA**AAMAAA**352eTdTmr/9WPYNRFiwqlBF0YaSYYxMb0/x47FUUGVf+arsNjWVgBYbykAr3liidutmewf56GJ9LeIVxuFTm9g1j+cygacDg7BOIkYqTeXOm0Au1VffrreBxdWdbnZ968mnGnRSR+pne1jtR3GQWds3VxVVhAzytp31Qx45EBFvmkXNBIzdvIoNoHJ1TbwAQuoBoHB6Hc4HYzkE4Rrn9wQKnagDIfUgNeNpQhJIX7r0p/nJgFAxyB1oTk7MTxNM2nVc6rfoI6bR/IJgEkSa50qeNV94yMyhg6plo7WVfpaKnGwo32VjS1zXYtD4QQYRv9m9k+pwxMP2sp94JcJGCyuNWzk8PBb2A0ENRyCQAl956qe9XO7CA69GcYVm+X3CpoJZe6tE7yv2Wl5CSMdIAROW76KTHS5VyXjQvks9aU4+OgKvDjfY9Ko39jsEIEeSvpTJ+KLoCOYH3aCXETBD0CG/nEMAbN3oQlzHuSlsvQSA6DjafPe3rUr4lLvTuz9LJQ6QoewIo1tXRInVIXJVYvwFTFLBtl/YH4Pgci6Eixi9w2WZZhsKXWPhoccPlDc8nHUHRWyuDNu3m4rokiuh+LDCUsd5uLZHJu75XFxBKn657n2jQQDWA8Zo59/JlY8ND714LFZks66WPdozVqDexpDSYgv9CPhG2hDKQv6HUFd+rwVM5zDc8jCmJNM1LiybfvKZkM5eeuClxYP8lCogbZVBso598oaLvgw18Qm5JFCdBJCP2BwjnPtfvcvr76Pbs',
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
      'ozontravel' => [
          'parthnerId' => 'xsjb68an',
          'login' => 'admin@secretdiscounter.com',
          'password' => '2011idnN@',
          'route' => 'ozon-travel',
          'file_loader' => [
              'method' => 'ozontravel',

          ],
      ],
      'booking.com' => [
          'route' => 'booking-com',
          'file_loader' => [
              //of frontend/modules/stores/models/FileImport
              'method' => 'booking',

          ],
      ],
      'playeurolotto' => [
          'ip' => '78.46.47.243',
          'route' => 'playeurolotto-com'
      ]
  ],
];
