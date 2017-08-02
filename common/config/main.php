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
}

return $config;