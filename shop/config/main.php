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
    'bootstrap' => ['log', 'minifyManager'],
    'components' => [
        'request' => [
            'csrfParam' => '_csrf-shop',
          // !!! insert a secret key in the following (if it is empty) - this is required by cookie validation
        ],
        'view' => [
            'class' => 'shop\components\SdView',
            'renderers' => [
                'twig' => [
                    'globals' => [
                        'ActiveForm' => '/yii/widgets/ActiveForm'
                    ]
                ]
            ]
        ],
        'minifyManager' => [
            'class' => 'maybeworks\minify\MinifyManager',
            'html' => !YII_DEBUG,
            'css' => false,
            'js' => false,
        ],
        'user' => [
            'identityClass' => 'frontend\modules\users\models\Users',
            'enableAutoLogin' => true,
            'identityCookie' => [
                'name' => '_identity-frontend',
                'httpOnly' => true,
                'path' => '/',
                'domain' => strpos(DOMAIN_FRONT, '.0.0.1') ? false : DOMAIN_FRONT,
            ],
            'loginUrl' => ['https://secretdiscounter.com/#login'],
//            'on afterLogin' => function ($event) {
//                frontend\modules\users\models\Users::afterLogin($event->identity->id,$event);
//            },

        ],
        'session' => [
          // this is the name of the session cookie used for login on the b2b
            //'name' => 'advanced-shop',
            'name' => 'advanced-frontend',
            'cookieParams' => [
                'domain' => (strpos(DOMAIN_FRONT, '.0.0.1') ? '' : '.') . DOMAIN_FRONT,
                'httpOnly' => true,
            ],
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
                '/category/<action:(product)>/<id:\d+>' => 'category/default/product',
                [ // обработка категорий товаров
                    'class' => 'shop\components\SdUrlCategories',
                ],
                '/category/<action>' => 'category/default/index',
                'vendor/<vendor>' => 'vendor/default/view',
                'goto/product:<product:\d+>' => 'site/goto',

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
        'vendor' => [
            'class' => 'shop\modules\vendor\Module',
        ],
    ],
];
