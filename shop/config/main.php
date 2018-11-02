<?php
$params = array_merge(
    require(__DIR__ . '/../../common/config/params.php'),
    require(__DIR__ . '/../../common/config/params-local.php'),
    require(__DIR__ . '/params.php'),
    require(__DIR__ . '/params-local.php')
);

return [
    'id' => 'app-shop',
    'basePath' => dirname(__DIR__),
    'controllerNamespace' => 'shop\controllers',
    'bootstrap' => ['log'],
    'components' => [
        'request' => [
            'csrfParam' => '_csrf-shop',
                // !!! insert a secret key in the following (if it is empty) - this is required by cookie validation
        ],
      'view'=>[
        'class' => 'shop\components\SdView',
        'renderers' => [
          'twig' => [
            'globals' => [
              'ActiveForm'=>'/yii/widgets/ActiveForm'
            ]
          ]
        ]
      ],
      'user' => [
            'identityClass' => 'frontend\modules\users\models\Users',
            'enableAutoLogin' => true,
            'identityCookie' => ['name' => '_identity-shop', 'httpOnly' => true],
            'loginUrl' => ['/login'],
        ],
        'session' => [
            // this is the name of the session cookie used for login on the b2b
            'name' => 'advanced-shop',
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
            'enableStrictParsing' => false,
            'rules' => [
                [ // обработка локализации сайта
                    'class' => 'shop\components\SdUrlLocalisation',
                ],
                '/category/<action:(product)>/<id:\d+>'=> 'category/default/product',
                '/category/<action>'=> 'category/default/index',

                '<module>/default/<action>' => '404',
                '<module>/default' => '404',

                //   '/' => 'site/index',
            //   '/index' => '404',
            //    '/home' =>'users/default/index',
            //    '<action:(login|logout|resetpassword|reset|register)>' => 'users/default/<action>',

            ],
        ],
        'assetManager' => [
            //'class' => 'yii\web\AssetManager',
            //'class' => 'shop\assets\AppAsset',
            'linkAssets' => false,
        ],
    ],
    'params' => $params,
    'modules' => [
        'category' => [
            'class' => 'shop\modules\category\Module',
        ],
    ],
]
;
