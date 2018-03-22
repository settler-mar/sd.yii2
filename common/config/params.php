<?php
return [
  'user.passwordResetTokenExpire' => 3600,
  //'scriptVersion'=>YII_DEBUG?'':'.min.'.file_get_contents(__DIR__.'/script_version.data').'.',
  'scriptVersion'=>YII_DEBUG?'' : '.min.',
  'exportDir' => 'export',

  'currencies' => [
      'RUB' => [
          'text' => 'руб',
          //'icon' => '<span class="fa fa-rub"></span>',
          //'icon' => "{{ svg('ruble', 'currency-icon-ruble')|raw }}",
          'svg' => 'ruble'
      ],
      'USD' => [
          'text' => 'usd',
          'icon' => '<span class="fa fa-usd"></span>',
          'svg' => 'dollar',
      ],
      'EUR' => [
          'text' => 'eur',
          'icon' => '<span class="fa fa-eur"></span>',
          'svg' => 'euro',
      ],
      'KZT' => [
          'text' => 'kzt',
          'icon' => 'kzt',
      ],
      'UAH' => [
          'text' => 'гр',
          'icon' => 'гр',
      ],
      'BYN' => [
          'text' => 'бел.руб',
          'icon' => 'бел.руб',
      ],
  ],
  'phone_countries' => [
    'Россия' => [
        'code' => '7',
        'template' => '(999)999-99-99'
    ],
    'Беларусь'=> [
        'code' => '375',
        'template' => '(99)999-99-99'
    ],
    'Украина'=> [
        'code' => '380',
        'template' => '(99)999-99-99'
    ],
    'Англия'=> [
        'code' => '44',
        'template' => '(99)999-99-99'
    ],
  ],
];
