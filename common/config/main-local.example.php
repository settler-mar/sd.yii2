<?php
return [
    'components' => [
      'db' => [
          'class' => 'yii\db\Connection',
          'dsn' => 'mysql:host=localhost;dbname=secretdiscounter',
          'username' => 'root',
          'password' => '123456',
          'charset' => 'utf8',
      ],
      'mailer' => [
        'class' => 'yii\swiftmailer\Mailer',
        'useFileTransport' => true,

        'host' => 'mail.ukraine.com.ua',
        'username' => 'admin@test.com',
        'password' => 'pass',
        'port' => '2525',
        'encryption' => 'tls',
      ],
      'cache' => [
        //'class' => 'yii\caching\FileCache',
        'class'=>'yii\caching\DummyCache',
        'defaultDuration' => 86400,
      ],
    ],
];
