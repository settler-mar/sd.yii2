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
      'view'=>[
        'class' => 'b2b\components\SdView',
        'renderers' => [
          'twig' => [
            'globals' => [
              'ActiveForm'=>'/yii/widgets/ActiveForm'
            ]
          ]
        ]
      ],
      'reCaptcha' => [
        'name' => 'reCaptcha',
        'class' => 'himiklab\yii2\recaptcha\ReCaptcha',
        'siteKey' => '6LcklDUUAAAAAHK_xOVtNRLsIEt5ARhirsS_M_pc',
        //'siteKey' => '6LcHwBsTAAAAAPdqjvMO86g1llZ32DJtzBtcFcXa',
        'secret' => '6LcklDUUAAAAAKJuCpga3iCnTeb7ypwMyVrH054_',
        //'secret' => '6LcHwBsTAAAAAGppzvtTXu1CBu1dZo3t_lqOXHyy',
      ],
        'user' => [
            'identityClass' => 'b2b\modules\users\models\B2bUsers',
            'enableAutoLogin' => true,
            'identityCookie' => ['name' => '_identity-b2b', 'httpOnly' => true],
            'on afterLogin' => function($event) {
              b2b\modules\users\models\B2bUsers::afterLogin($event->identity->id);
            },
            'loginUrl' => ['/login'],
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
            'enableStrictParsing' => false,
            'rules' => [
                '/' => 'content/default/main',
                '/index' => '404',
                '/home' =>'users/default/index',
                '<action:(login|logout|resetpassword|reset|register)>' => 'users/default/<action>',

                '<action:(registration)>' => 'forms/default/<action>',
                'forms/<action:(offline|online)>' => 'forms/default/<action>',
                'forms/default/<action>' => '404',

                '/stores_points/<action:(create|update|delete|login|logout|payments)>' => 'stores_points/default/<action>',
                '/payments/<action:(index|update|status|revoke)>' => 'payments/default/<action>',
                '/api/<action:(login|categories|save|msg)>' => 'api/default/<action>',
                '/api/<controller>/<action2>' => '404', //закрываем доступ
                [
                    'class' => 'b2b\components\ContentUrlRule',
                ],
            ],
        ],
        'storePointUser' => [
            'class' => 'b2b\components\StorePointUser',
        ],
    ],
    'params' => $params,
    'modules' => [
        'users' => [
            'class' => 'b2b\modules\users\Module',
        ],
        'stores_points' => [
            'class' => 'b2b\modules\stores_points\Module',
        ],
        'content' => [
            'class' => 'b2b\modules\content\Module',
        ],
        'api' => [
            'class' => 'app\modules\api\Module',
        ],
        'payments' => [
            'class' => 'b2b\modules\payments\Module',
        ],
        'forms' => [
            'class' => 'b2b\modules\forms\Module',
        ],
    ],
    //для возврата с формы login на предыдущую страницу
    'on beforeAction' => function (yii\base\ActionEvent $e) {
      if (Yii::$app->user->isGuest) {
        $request = Yii::$app->request;
        // исключаем страницу авторизации или ajax-запросы
        if (!($request->isAjax ||
            strpos($request->url, 'login') !== false ||
            strpos($request->url, 'g=plugin') !== false
        )) {
          Yii::$app->user->setReturnUrl($request->url);
        }
      }
    },
]
;
