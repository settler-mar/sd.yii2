<?php

$params = array_merge(
    require(__DIR__ . '/../../common/config/params.php'),
    require(__DIR__ . '/../../common/config/params-local.php'),
    require(__DIR__ . '/params.php')/*,
    require(__DIR__ . '/params-local.php')*/
);

return [
    'id' => 'go-api',
    'basePath' => dirname(__DIR__),
    'bootstrap' => ['log'],
    'controllerNamespace' => 'go\controllers',
    'modules' => [

    ],
    'components' => [
        'user' => [
            'identityClass' => 'common\models\User',
            'enableAutoLogin' => false,
        ],
        'log' => [
            'traceLevel' => YII_DEBUG ? 3 : 0,
            'targets' => [
                [
                    'class' => 'yii\log\FileTarget',
                    'levels' => ['error', 'warning'],
                ],
            ],
        ],
        'urlManager' => [
            'enablePrettyUrl' => true,
            'enableStrictParsing' => false,
            'showScriptName' => false,
            'rules' => [
                //'<action:index|stores|payments>' => 'site/<action>'
                //'/' => 'site/index'


            ],
        ],
        'session' => [
            'name' => 'advanced-sd-api',
        ],
        'request' => [
            'cookieValidationKey' => '655wgregers555jyyrj65',
        ],
    ],
    'params' => $params,
];



