<?php
$config = [
    'components' => [
        'request' => [
          // !!! insert a secret key in the following (if it is empty) - this is required by cookie validation
            'cookieValidationKey' => 'JA6Z4ogm9gRIe6S-nICb-OzZOTXNVhMB',
        ],
        'db_blog' => [
            'class' => 'yii\db\Connection',
            'dsn' => 'mysql:host=localhost;dbname=sdblog',
            'username' => 'root',
            'password' => '123456',
            'charset' => 'utf8',
        ],
    ],
];

return $config;