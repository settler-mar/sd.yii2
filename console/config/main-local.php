<?php
return [
    'bootstrap' => ['gii'],
    'modules' => [
        'gii' => 'yii\gii\Module',
        'debug' => null,
    ],
    'components' => [
        'cache' => [
            'class' => 'yii\caching\FileCache',
            'keyPrefix' => 'console', // уникальный префикс ключей кэша
        ],
    ],
];
