<?php
$twigFunction=require (dirname(dirname(__DIR__)) . '/helpers/twigFunctionList.php');
$twigFunction['translate']='\Yii::t';

include_once (__DIR__.'/start_param.php');
$dict=require (__DIR__.'/dictionary.php');

$config = [
  'name'=>'SecretDiscounter',
  'language' => 'ru-RU',
  'vendorPath' => dirname(dirname(__DIR__)) . '/vendor',
  'components' => [
    'cache'=>[
      'keyPrefix' => 'sd', // уникальный префикс ключей кэша
    ],
    'urlManager' => [
      'class' => 'yii\web\UrlManager',
      'enablePrettyUrl' => true,
      'showScriptName' => false,
      'enableStrictParsing' => true,
      'rules' => [
      ],
    ],
    'mailer'=>[
      'viewPath' => '@common/mail',
      'htmlLayout' => 'layouts/html',
      'textLayout' => 'layouts/text',
    ],
    'authManager' => [
      'class' => 'yii\rbac\DbManager',
      //'cache' => 'yii\caching\FileCache',
    ],
    'sphinx' => [
      'class' => 'yii\sphinx\Connection',
      'dsn' => 'mysql:host=127.0.0.1;port=9306;',
      'username' => '',
      'password' => '',
    ],
    'assetManager' => [
      'bundles' => [
        //'yii\bootstrap\BootstrapAsset' => true,
        //'yii\validators\ValidationAsset' => false,
        //'yii\web\YiiAsset' => false,
        //'yii\widgets\ActiveFormAsset' => false,
        //'yii\bootstrap\BootstrapPluginAsset' => false,
        //'yii\web\JqueryAsset' => false,
        //'yii\authclient\widgets\AuthChoiceAsset' => false, //authchoice.js
        //'yii\authclient\widgets\AuthChoiceStyleAsset' => false, //authchoice.css
      ],
      'linkAssets' => true,
      'appendTimestamp' => true,
    ],
    'TwigString'=>[
      'class'=>'common\components\TwigString',
      'params'=>[
        'cachePath' => '@runtime/Twig/cache',
        'functions' => $twigFunction,
      ],
    ],
    'view' => [
      'class' => 'yii\web\View',
      'defaultExtension' => 'twig',
      'renderers' => [
        'twig' => [
          'class' => 'yii\twig\ViewRenderer',
          'cachePath' => '@runtime/Twig/cache',
          // Array of twig options:
          'options' => YII_DEBUG?[
            'debug' => true,
            'auto_reload' => true,
          ]:[
            'auto_reload' => true,
          ],
          'globals' => [
            'html' => '\yii\helpers\Html',
            'url' => 'yii\helpers\Url',
            'ActiveForm'=>'yii\bootstrap\ActiveForm',
          ],
          'functions' => $twigFunction,
          'uses' => ['yii\bootstrap'],
          'extensions' => YII_DEBUG?[
            '\Twig_Extension_Debug',
            ]:[
            ]
        ],
      ],
    ],
    'log' => [
      'traceLevel' => YII_LOG_LEVEL,
      'targets' => [
        [
          'class' => 'yii\log\FileTarget',
          'levels' => ['error', 'warning'],
          'logFile' => 'log/'.date('Y/m/d').'.log'
        ],
      ],
    ],
    'conversion' => [
        'class' => 'common\components\Conversion',
        'cache_duration' => 7200,
        'options' => ["USD", "EUR", "UAH", "KZT"]
     ],
    'balanceCalc' => [
        'class' => 'common\components\BalanceCalc',
     ],
    'messageParcer' => [
        'class' => 'common\components\MessageParser',
     ],
    //'db' => require __DIR__.'/db.php'
  ],
  'params'=>[
    'dictionary'=>$dict
  ]
];

if (YII_DEBUG) {
  // configuration adjustments for 'dev' environment
  $config['bootstrap'][] = 'debug';
  $config['modules']['debug'] = [
    'class' => 'yii\debug\Module',
  ];
  $config['bootstrap'][] = 'gii';
  $config['modules']['gii'] = [
    'class' => 'aayaresko\gii\Module',
    'allowedIPs' => ['127.0.0.1', '::1', '192.168.0.*', '192.168.1.*'],
    'generators' => [ // здесь
      /*'crud' => [ // название генератора
        'class' => 'yii\gii\generators\crud\Generator', // класс генератора
        'templates' => [ // настройки сторонних шаблонов
          'myCrud' => '@app/myTemplatesGii/crud/admin', // имя_шаблона => путь_к_шаблону
        ]
      ]*/
    ],
  ];
  //Add kint
  $config['bootstrap'][] = 'kint';
  $config['modules']['kint'] = [
    'class' => 'digitv\kint\Module',
  ];
}

return $config;