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
              /*'host' => 'smtp.mail.ru',
              'username' => 'support@secretdiscounter.com',
              'password' => '2011odnN@',
              'port' => '587',
              'encryption' => 'tls',*/

                'host' => 'smtp.gmail.com',
                'username' => 'secretdiscounter.ru@gmail.com',
                'password' => '2011odnN@',
                'port' => '587',
                'encryption' => 'tls',
              //'port' => '465',
              //'port' => '2525',
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
