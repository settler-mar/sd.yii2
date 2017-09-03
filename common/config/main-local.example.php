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
        'useFileTransport' => false,

        'transport' => [
          'class' => 'Swift_SmtpTransport',
          'host' => 'smtp.mail.ru',
          'username' => 'support@secretdiscounter.ru',
          'password' => '??????????',
          //'port' => '465',
          //'port' => '2525',
          'port' => '587',
          'encryption' => 'tls',
          //'extraParams' => null*/
        ]
      ],
      'cache' => [
        //'class' => 'yii\caching\FileCache',
        'class'=>'yii\caching\DummyCache',
        'defaultDuration' => 86400,
      ],
    ],
];
