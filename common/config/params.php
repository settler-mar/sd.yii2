<?php
return [
  'user.passwordResetTokenExpire' => 3600,
  'scriptVersion'=>YII_DEBUG?'':'.min.'.file_get_contents(__DIR__.'/script_version.data').'.',
  'pathToScript'=>require __DIR__.'/path_scripts.php',
  'exportDir' => 'export',

  'currencies' => [
      'RUB' => [
          'text' => 'руб',
          'icon' => '<span class="fa fa-rub"></span>',
      ],
      'USD' => [
          'text' => 'usd',
          'icon' => '<span class="fa fa-usd"></span>',
      ],
      'EUR' => [
          'text' => 'eur',
          'icon' => '<span class="fa fa-eur"></span>',
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
  ]
];
