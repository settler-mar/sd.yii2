<?php
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
      'renderers' => [
        'twig' => [
          'class' => 'yii\twig\ViewRenderer',
          'cachePath' => '@runtime/Twig/cache',
          // Array of twig options:
          'options' => [
            'auto_reload' => true,
          ],
          'globals' => [
              'html' => '\yii\helpers\Html',
              'arhelp'=>'\yii\helpers\ArrayHelper',
              'url'=>'yii\helpers\Url'
          ],
          'uses' => ['yii\bootstrap'],
          'extensions' => [
            ]
        ],
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
  ],
];

if (YII_ENV_DEV) {
  // configuration adjustments for 'dev' environment
  $config['bootstrap'][] = 'debug';
  $config['modules']['debug'] = [
    'class' => 'yii\debug\Module',
  ];
  $config['bootstrap'][] = 'gii';
  $config['modules']['gii'] = [
    'class' => 'yii\gii\Module',
    'allowedIPs' => ['127.0.0.1', '::1', '192.168.0.*', '192.168.1.*'],
    'generators' => [
      'twigcrud' => [
        'class' => 'esquire900\yii2-giiant-twig\crud\Generator', // generator class
        'templates' => [
          'twigCrud' => '@esquire900/yii2-giiant-twig/crud/default',
        ]
      ]
    ],
  ];
}

return $config;