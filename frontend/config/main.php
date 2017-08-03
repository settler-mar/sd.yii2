<?php
$params = array_merge(
  require(__DIR__ . '/../../common/config/params.php'),
  require(__DIR__ . '/../../common/config/params-local.php'),
  require(__DIR__ . '/params.php'),
  require(__DIR__ . '/params-local.php')
);

return [
  'id' => 'app-frontend',
  'basePath' => dirname(__DIR__),
  'bootstrap' => ['log'],
  'controllerNamespace' => 'frontend\controllers',
  'components' => [
    'request' => [
      'csrfParam' => '_csrf-frontend',
    ],
    'user' => [
      'identityClass' => 'app\modules\user\models\User',
      'enableAutoLogin' => true,
      //'loginUrl' => ['/'],
      'on afterLogin' => function($event) {
        frontend\modules\users\models\Users::afterLogin($event->identity->id);
      }
    ],
    'user' => [
      'identityClass' => 'common\models\User',
      'enableAutoLogin' => true,
      'identityCookie' => ['name' => '_identity-frontend', 'httpOnly' => true],
    ],
    'session' => [
      // this is the name of the session cookie used for login on the frontend
      'name' => 'advanced-frontend',
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
    'view'=>[
      'class' => 'frontend\controllers\SdView',
      'renderers' => [
        'twig' => [
          'globals' => [
            'AppAsset'=>'frontend\assets\AppAsset'
          ]
        ]
      ]
    ]
    /*
    'urlManager' => [
      'enablePrettyUrl' => true,
      'showScriptName' => false,
      'rules' => [
      ],
    ],
    */
  ],
  'modules' => [
    'users' => [
      'class' => 'app\modules\users\Module',
    ],
  ],
  'params' => $params,
];
