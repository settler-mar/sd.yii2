<?php
return [
  'components' => [
    'db' => [
      'class' => 'yii\db\Connection',
      'dsn' => 'mysql:host=localhost;dbname=secretdiscounter',
      'username' => 'root',
      'password' => '123456',
      'charset' => 'utf8mb4',
    ],
    'mailer' => [
      'class' => 'yii\swiftmailer\Mailer',
      'viewPath' => '@common/mail',
      'useFileTransport' => true,

      'transport' => [
        'class' => 'Swift_SmtpTransport',

        'host' => '',
        'username' => '',
        'password' => '',
        'port' => '587',
        'encryption' => 'tls',

      ]
    ],
    'cache' => [
      //'class' => 'yii\caching\FileCache',
      'class'=>'yii\caching\DummyCache',
      'defaultDuration' => 86400,
    ],
  ],
  'params'=>[
      'valuta' => "RUB",
      'valuta_list' => [
          'RUB','USD','EUR','KZT','UAH','BYN'
      ]
  ],
];
