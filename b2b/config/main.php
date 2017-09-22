<?php
$params = array_merge(
    require(__DIR__ . '/../../common/config/params.php'),
    require(__DIR__ . '/../../common/config/params-local.php'),
    require(__DIR__ . '/params.php'),
    require(__DIR__ . '/params-local.php')
);

return [
    'id' => 'app-b2b',
    'basePath' => dirname(__DIR__),
    'controllerNamespace' => 'b2b\controllers',
    'bootstrap' => ['log'],
    'components' => [
        'request' => [
            'csrfParam' => '_csrf-b2b',
        ],
        'user' => [
            'identityClass' => 'b2b\modules\users\models\B2bUsers',
            'enableAutoLogin' => true,
            'identityCookie' => ['name' => '_identity-b2b', 'httpOnly' => true],
            'on afterLogin' => function($event) {
              b2b\modules\users\models\B2bUsers::afterLogin($event->identity->id);
            }
        ],
        'session' => [
            // this is the name of the session cookie used for login on the b2b
            'name' => 'advanced-b2b',
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
        'errorHandler' => [
            'errorAction' => 'site/error',
        ],
        'urlManager' => [
            'enablePrettyUrl' => true,
            'showScriptName' => false,
            'rules' => [
                '/' => 'site/index',
                '<action:(login|logout|resetpassword|reset)>' => 'users/default/<action>',
            ],
        ],
    ],
    'params' => $params,
    'modules' => [
        'users' => [
            'class' => 'b2b\modules\users\Module',
        ],
    ],
];
