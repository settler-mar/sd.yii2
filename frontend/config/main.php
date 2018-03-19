<?php
$params = array_merge(
  require(__DIR__ . '/../../common/config/params.php'),
  require(__DIR__ . '/../../common/config/params-local.php'),
  require(__DIR__ . '/params.php'),
  require(__DIR__ . '/params-local.php')
);
$params['meta'] = require(__DIR__ . '/meta.php');

//use zxbodya\yii2\tinymce\TinyMce;
use \dominus77\tinymce\TinyMce;

$config = [
  'id' => 'app-frontend',
  'basePath' => dirname(__DIR__),
  'bootstrap' => ['log'],
  'controllerNamespace' => 'frontend\controllers',
  'components' => [
    'request' => [
      'csrfParam' => '_csrf-frontend',
    ],
    'assetManager' => [
      'bundles' => [
        'yii\bootstrap\BootstrapAsset' => [
          'sourcePath' => null,   // не опубликовывать комплект
          'js' => [],
          'css' => [],
        ],
        'yii\web\JqueryAsset' => [
          'sourcePath' => null,   // не опубликовывать комплект
          'js' => [
            '//ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js',
          ]
        ],
        'bootstrap.js' => false,
        'bootstrap.css' => false,
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
    'eauth' => [
      'class' => 'nodge\eauth\EAuth',
      'popup' => true, // Use the popup window instead of redirecting.
      'cache' => false, // Cache component name or false to disable cache.Defaults to'cache' on production environments.
      'cacheExpire' => 0, // Cache lifetime. Defaults to 0 - means unlimited.
      'httpClient' => [
        // uncomment this to use streams in safe_mode
        //'useStreamsFallback' => true,
      ],
      'services' => require('socials.php'),
    ],
    'i18n' => [
      'translations' => [
        'eauth' => [
          'class' => 'yii\i18n\PhpMessageSource',
          'basePath' => '@eauth/messages',
        ],
        /*'account*' => [
        'class' => 'yii\i18n\PhpMessageSource',
        'basePath' => '@app/language',
        ],
        'common*' => [
        'class' => 'yii\i18n\PhpMessageSource',
        'basePath' => '@app/language',
        ],
        'dictionary*' => [
        'class' => 'yii\i18n\PhpMessageSource',
        'basePath' => '@app/language',
        ],
        /*'common*' => [
        'class' => 'yii\i18n\PhpMessageSource',
        'basePath' => '@app/language',
        ],
        /*'yii' => [
        'class' => 'yii\i18n\PhpMessageSource',
        'sourceLanguage' => 'en-US',
        'basePath' => '@app/language'
        ],*/
      ],
    ],
    'user' => [
      'identityClass' => 'frontend\modules\users\models\Users',
      'enableAutoLogin' => true,
      'identityCookie' => [
        'name' => '_identity-frontend',
        'httpOnly' => true
      ],
      'on afterLogin' => function ($event) {
        frontend\modules\users\models\Users::afterLogin($event->identity->id);
      }
    ],
    'errorHandler' => [
      'errorAction' => 'site/error',
    ],
    'view' => [
      'class' => 'frontend\components\SdView',
      'renderers' => [
        'twig' => [
          'globals' => [
            'AppAsset' => 'frontend\assets\AppAsset',
            'Fotorama' => '\kotchuprik\fotorama\Widget',
            'TinyMce' => TinyMce::className(),
          ]
        ]
      ]
    ],
    'urlManager' => [
      'rules' => [
        'site/<action>' => '404',
        [ // обработка слэш в конце и двойных слэшэй
          'class' => 'frontend\components\SdUrlSlash',
        ],
        [ // обработка реферальных ссылок
          'class' => 'frontend\components\SdUrlPromo',
        ],
        [ // обработка перехода после авторизации из админки под пользователем обратно в админку
            'class' => 'frontend\components\SdUrlAdmin',
        ],
        /*'users/<action>/<action>'=>'404',
        'users/<action>/<action>/<action>'=>'404',*/

        //'el-finder/connector'=>'el-finder/connector',
        //'connector/el-finder/manager'=>'el-finder/connector/manager',

        '<action:(login|logout|registration|registration-web|resetpassword|reset|verifyemail|verifysocialemail)>' =>
          'users/default/<action>',
        'login/socials' => 'users/default/socials',
        'login/socials-email' => 'users/default/socialemail',
        'login/socials-result' => 'users/default/socialemailresult',
        'account' => 'users/account/welcome',
        'account/settings' => 'users/account/settings',
        'account/<action:offline>' => 'account/<action>',
        'account/sendverifyemail' => 'users/account/sendverifyemail',
        'account/email-success' => 'users/account/emailsuccess',
        'account/webmaster' => 'affiliate/account/index',
        'account/promo' => 'users/default/promo',
        'deleteaccount' => 'users/account/delete',

        'search' => 'search/default/index',
        'search/coupon' => 'search/default/coupon',
        'search/<action>' => '404',
        'coupons/search' => '404',

        '<action:(faq|admin|loyalty|recommendations|offline)>' => 'site/<action>',
        'affiliate-system' => 'site/affiliate',
        'offline-system' => 'site/offline-system',
        'account-blocked' => 'site/accountblocked',

        'fixing/<action:payment|stores>' => 'fixing/<action>',

        'permit/<controller:\w+>/<action:(\w|-)+>' => 'permit/<controller>/<action>',
        'permit/<controller:\w+>/<action:(\w|-)+>/<id:\d+>' => 'permit/<controller>/<action>',

        [ // Обновлении мадели для работы с адресми и роутингом
          'class' => 'frontend\components\SdUrlRule',
        ],
      ],
      'normalizer' => [
        'class' => 'yii\web\UrlNormalizer',
      ],

    ],
  ],
  'modules' => [
    /*'manager'=> [
      'class' => 'frontend\modules\manager\Module',
    ],*/
    'users' => [
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
    'b2b_users' => [
      'class' => 'frontend\modules\b2b_users\Module',
    ],
    'b2b_content' => [
      'class' => 'frontend\modules\b2b_content\Module',
    ],
    'banners' => [
      'class' => 'frontend\modules\banners\Module',
    ],
    'sdblog' => [
      'class' => 'app\modules\sdblog\Module',
    ],
  ],
  'params' => $params,

  'controllerMap' => [
    'elfinder' => [
      'class' => 'mihaildev\elfinder\Controller',
      'access' => ['@'], //глобальный доступ к фаил менеджеру @ - для авторизорованных , ? - для гостей , чтоб открыть всем ['@', '?']
      'disabledCommands' => ['netmount'], //отключение ненужных команд https://github.com/Studio-42/elFinder/wiki/Client-configuration-options#commands
      'roots' => [
        [
          'baseUrl' => '@web',
          'basePath' => '@webroot',
          'path' => 'img',
          'name' => 'Пользовательские',
          'access' => ['read' => 'FilesEdit', 'write' => 'FilesEdit']
        ],
        [
          'baseUrl' => '@web',
          'basePath' => '@webroot',
          'path' => 'images',
          'name' => 'Системные',
          'access' => ['read' => 'FilesEdit', 'write' => false]
        ],
        /*[
          'class' => 'mihaildev\elfinder\UserPath',
          'path'  => 'files/user_{id}',
          'name'  => 'My Documents'
        ],
        [
          'path' => 'files/some',
          'name' => ['category' => 'my','message' => 'Some Name'] //перевод Yii::t($category, $message)
        ],
        [
          'path'   => 'files/some',
          'name'   => ['category' => 'my','message' => 'Some Name'], // Yii::t($category, $message)
          'access' => ['read' => '*', 'write' => 'UserFilesAccess'] // * - для всех, иначе проверка доступа в даааном примере все могут видет а редактировать могут пользователи только с правами UserFilesAccess
        ]*/
      ],
    ]
  ],

  //для возврата с авторизации через соц. сети на предыдущую страницу
  'on beforeAction' => function (yii\base\ActionEvent $e) {
    if (Yii::$app->user->isGuest) {
    $request = Yii::$app->request;
    // исключаем страницу авторизации или ajax-запросы
    if (!$request->isAjax &&
      strpos($request->url, 'login') === false &&
      strpos($request->url, 'verifysocialemail') === false
    ) {
      Yii::$app->user->setReturnUrl($request->url);
    }
    }
  },
];


if (YII_DEBUG) {
  // configuration adjustments for 'dev' environment
  unset($config['modules']['permit']['params']['accessRoles']);
}
return $config;