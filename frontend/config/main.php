<?php
$params = array_merge(
  require(__DIR__ . '/../../common/config/params.php'),
  require(__DIR__ . '/../../common/config/params-local.php'),
  require(__DIR__ . '/params.php'),
  require(__DIR__ . '/params-local.php')
);
$params['meta']=require (__DIR__.'/meta.php');


$config= [
  'id' => 'app-frontend',
  'basePath' => dirname(__DIR__),
  'bootstrap' => ['log'],
  'controllerNamespace' => 'frontend\controllers',
  'components' => [
    'request' => [
      'csrfParam' => '_csrf-frontend',
    ],
    'assetManager'=>[
      'bundles'=>[
        'yii\bootstrap\BootstrapAsset' => [
          'js' => [],
        ],
        'bootstrap.js'=>false,
      ]
    ],
    'session' => [
      // this is the name of the session cookie used for login on the frontend
      'name' => 'advanced-frontend',
    ],
    'sphinx' => [
      'class' => 'yii\sphinx\Connection',
      'dsn' => 'mysql:host=127.0.0.1;port=9306;',
      'username' => 'root',
      'password' => '123456',
    ],
    'log' => [
      'traceLevel' => YII_LOG_LEVEL ? YII_LOG_LEVEL : 0,
      'targets' => [
        [
          'class' => 'yii\log\FileTarget',
          'levels' => ['error', 'warning'],
        ],
      ],
    ],
    'user' => [
      'identityClass' => 'frontend\modules\users\models\Users',
      'enableAutoLogin' => true,
      'identityCookie' => [
        'name' => '_identity-frontend',
        'httpOnly' => true
      ],
      'on afterLogin' => function($event) {
        frontend\modules\users\models\Users::afterLogin($event->identity->id);
      }
    ],
    'errorHandler' => [
      'errorAction' => 'site/error',
    ],
    'view'=>[
      'class' => 'frontend\components\SdView',
      'renderers' => [
        'twig' => [
          'globals' => [
            'AppAsset'=>'frontend\assets\AppAsset'
          ]
        ]
      ]
    ],
    'urlManager' => [
      'rules' => [
        'site/<action>'=>'404',
        /*'users/<action>/<action>'=>'404',
        'users/<action>/<action>/<action>'=>'404',*/

        '<action:(login|logout|registration|ulogin|resetpassword|reset)>' => 'users/default/<action>',
        'account' => 'users/account/welcome',
        'account/settings' => 'users/account/settings',

        'search' => 'search/default/index',
        'search/<action>' => '404',

        'admin' => 'site/admin',
        'faq' => 'site/faq',
        'howitworks' => 'site/howitworks',
        'terms' => 'site/terms',
        'promo' => 'site/promo',
        'affiliate-system' => 'site/affiliate',
        'loyalty' => 'site/loyalty',
        'recommendations' => 'site/recommendations',
        'about' => 'site/about',
        'account-blocked' => 'site/accountblocked',

        'fixing/<action:payment|stores>'=> 'fixing/<action>',

        'permit/<controller:\w+>/<action:(\w|-)+>' => 'permit/<controller>/<action>',
        'permit/<controller:\w+>/<action:(\w|-)+>/<id:\d+>' => 'permit/<controller>/<action>',

        [ // Обновлении мадели для работы с адресми и роутингом
          'class' => 'frontend\components\SdUrlRule',
        ],

      ],
    ],
  ],
  'modules' => [
    'users'=> [
      'class' => 'frontend\modules\users\Module',
    ],
    'stores' => [
        'class' => 'frontend\modules\stores\Module',
    ],
    'reviews' => [
      'class' => 'frontend\modules\reviews\Module',
    ],
    'permit' => [
      'class' => 'developeruz\db_rbac\Yii2DbRbac',
      'params' => [
        'userClass' => 'frontend\modules\users\models\Users',
        'accessRoles' => ['admin']
      ]
    ],
    'constants' => [
      'class' => 'frontend\modules\constants\Module',
    ],
    'meta' => [
      'class' => 'frontend\modules\meta\Module',
    ],
    'coupons' => [
      'class' => 'frontend\modules\coupons\Module',
    ],
    'slider' => [
      'class' => 'frontend\modules\slider\Module',
    ],
    'dobro' => [
      'class' => 'frontend\modules\dobro\Module',
    ],
    'payments' => [
      'class' => 'frontend\modules\payments\Module',
    ],
    'bonuses' => [
      'class' => 'frontend\modules\bonuses\Module',
    ],
    'notification' => [
      'class' => 'frontend\modules\notification\Module',
    ],
    'transitions' => [
      'class' => 'frontend\modules\transitions\Module',
    ],
    'withdraw' => [
      'class' => 'frontend\modules\withdraw\Module',
    ],
    'charity' => [
      'class' => 'frontend\modules\charity\Module',
    ],
    'funds' => [
      'class' => 'frontend\modules\funds\Module',
    ],
    'support' => [
      'class' => 'frontend\modules\support\Module',
    ],
    'favorites' => [
      'class' => 'frontend\modules\favorites\Module',
    ],
    'affiliate' => [
      'class' => 'frontend\modules\affiliate\Module',
    ],
    'search' => [
      'class' => 'frontend\modules\search\Module',
    ],
    'cache' => [
      'class' => 'frontend\modules\cache\Module',
    ],
  ],
  'params' => $params,
];


if (YII_DEBUG) {
  // configuration adjustments for 'dev' environment
  unset($config['modules']['permit']['params']['accessRoles']);
}
return $config;