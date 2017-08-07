<?php
$config = [
  'components' => [
    'request' => [
      // !!! insert a secret key in the following (if it is empty) - this is required by cookie validation
      'cookieValidationKey' => 'JA6Z4ogm9gRIe6S-nICb-OzZOTXNVhMB',
    ],
    'cache' => [
      'class'=>'yii\caching\DummyCache',
      'defaultDuration' => 86400,
    ],
  ],
];

return $config;