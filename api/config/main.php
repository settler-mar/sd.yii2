<?php

$params = array_merge(
    require(__DIR__ . '/../../common/config/params.php'),
    require(__DIR__ . '/../../common/config/params-local.php'),
    require(__DIR__ . '/params.php'),
    require(__DIR__ . '/params-local.php')
);

return [
    'id' => 'app-api',
    'basePath' => dirname(__DIR__),
    'bootstrap' => ['log'],
    'controllerNamespace' => 'api\controllers',
    'modules' => [
        'oauth2' => [
            'class' => 'filsh\yii2\oauth2server\Module',
            'components' => [
                'request' => function () {
                    return \filsh\yii2\oauth2server\Request::createFromGlobals();
                },
            ],
            //'options' => [
             //   'token_param_name' => 'accessToken',
            //    'access_lifetime' => 3600 * 24,
           // ],
            'storageMap' => [
               // 'user_credentials' => 'api\models\User',
            ],
            'grantTypes' => [
                'user_credentials' => [
                    //'class' => 'OAuth2\GrantType\UserCredentials',
                    'class' => 'api\components\UserCredentials',

                ],
                'refresh_token' => [
                    'class' => 'OAuth2\GrantType\RefreshToken',
                    'always_issue_new_refresh_token' => true
                ]
            ]
        ],
    ],
    'components' => [
        'user' => [
            'identityClass' => 'api\models\User',
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
                '<action:stores|payments>' => 'site/<action>',
                'POST oauth2/<action:\w+>' => 'oauth2/rest/<action>'
            ],
        ],
        'session' => [
            'name' => 'advanced-sd-api',
        ],
        'request' => [
            'cookieValidationKey' => '655wgregers555jyyrj65',
        ],
        'response' => [
            'class' => 'yii\web\Response',
            'on beforeSend' => function ($event) {
                $response = $event->sender;
                if (isset($response->data['type'])) {
                    unset($response->data['type']);
                }
            },
        ],
    ],
    'params' => $params,
];



