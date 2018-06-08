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
          'text' => 'грн',
          'icon' => 'грн',
      ],
      'BYN' => [
          'text' => 'бел.руб',
          'icon' => 'бел.руб',
      ],
  ],
  'regions_list' => require(__DIR__ . '/regions.config-local.php'),

  'rating_calculate_interval' => 12,

  'configs' => [
      [
          'config' => 'sellaction_categories.json',
          'title' => 'Категории Sellaction',
      ]
  ],

];
