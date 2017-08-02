<?php
$twigFunction=require (dirname(dirname(__DIR__)) . '/helpers/twigFunctionList.php');
$twigFunction['translate']='\Yii::t';

$config = [
  'vendorPath' => dirname(dirname(__DIR__)) . '/vendor',
  'components' => [
    'cache' => [
        'class' => 'yii\caching\FileCache',
    ],
    'urlManager' => [
      'enablePrettyUrl' => true,
      'showScriptName' => false,
      'rules' => [
      ],
    ],
    'sphinx' => [
      'class' => 'yii\sphinx\Connection',
      'dsn' => 'mysql:host=127.0.0.1;port=9306;',
      'username' => '',
      'password' => '',
    ],
    'assetManager' => [
      'bundles' => [
        'yii\bootstrap\BootstrapAsset' => false,
        'yii\validators\ValidationAsset' => false,
        'yii\web\YiiAsset' => false,
        'yii\widgets\ActiveFormAsset' => false,
        'yii\bootstrap\BootstrapPluginAsset' => false,
        'yii\web\JqueryAsset' => false,
        //'yii\authclient\widgets\AuthChoiceAsset' => false, //authchoice.js
        //'yii\authclient\widgets\AuthChoiceStyleAsset' => false, //authchoice.css
      ],
      'linkAssets' => true,
      'appendTimestamp' => true,
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
        ],
      ],
    ],
    'db' => require __DIR__.'/db.php'
  ],
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
    'generators' => [

    ],
  ];
  //Add kint
  $config['bootstrap'][] = 'kint';
  $config['modules']['kint'] = [
    'class' => 'digitv\kint\Module',
  ];
}

return $config;