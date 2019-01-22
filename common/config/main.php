<?php
$twigFunction = require(dirname(dirname(__DIR__)) . '/common/components/twigFunctionList.php');
$twigFunction['translate'] = '\Yii::t';

include_once(__DIR__ . '/aliases.php');
include_once(__DIR__ . '/start_param.php');
$dict = require(__DIR__ . '/dictionary.php');
$reCaptcha = include_once(__DIR__ . '/recaptcha-local.php');


if (!function_exists('get_ip')) {
  function get_ip()
  {
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
      $ip = $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
      $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
    } else {
      if (isset($_SERVER['REMOTE_ADDR'])) {
        $ip = $_SERVER['REMOTE_ADDR'];
      } else {
        $ip = "0.0.0.0";
      }
    }
    return $ip;
  }
}

$config = [
    'name' => 'SecretDiscounter',
    'sourceLanguage' => 'ru-dev',
    'aliases' => [
        '@bower' => '@vendor/bower-asset',
        '@npm' => '@vendor/npm-asset',
    ],
    'language' => defined('LANGUAGE') ? LANGUAGE : 'ru-RU',
    'timeZone' => 'Europe/Moscow',
    'vendorPath' => dirname(dirname(__DIR__)) . '/vendor',
    'bootstrap' => [
        'queue', // Компонент регистрирует свои консольные команды
    ],
    'components' => [
        'formatter' => [
            'dateFormat' => 'dd.MM.yyyy',
            'decimalSeparator' => ',',
            'thousandSeparator' => ' ',
            'currencyCode' => 'RUB',
        ],
        'cache' => [
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
        'mailer' => [
            'viewPath' => '@common/mail',
            'htmlLayout' => 'layouts/html',
            'textLayout' => 'layouts/text',
        ],
        'authManager' => [
            'class' => 'yii\rbac\DbManager',
          //'cache' => 'yii\caching\FileCache',
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
        'TwigString' => [
            'class' => 'common\components\TwigString',
            'params' => [
                'cachePath' => '@runtime/Twig/cache',
                'functions' => $twigFunction,
            ],
        ],
        'help' => [
            'class' => 'common\components\Help',
        ],
        'globals' => [
            'class' => 'common\components\Globals',
        ],
        'view' => [
            'class' => 'yii\web\View',
            'defaultExtension' => 'twig',
            'renderers' => [
                'twig' => [
                    'class' => 'yii\twig\ViewRenderer',
                    'cachePath' => '@runtime/Twig/cache',
                  // Array of twig options:
                    'options' => YII_DEBUG ? [
                        'debug' => true,
                        'auto_reload' => true,
                    ] : [
                        'auto_reload' => true,
                    ],
                    'globals' => [
                        'html' => '\yii\helpers\Html',
                        'url' => 'yii\helpers\Url',
                        'ActiveForm' => 'yii\bootstrap\ActiveForm',
                        'MultipleInput' => 'unclead\multipleinput\MultipleInput',
                        'MaskedInput' => 'yii\widgets\MaskedInput',
                    ],
                    'functions' => $twigFunction,
                    'uses' => ['yii\bootstrap'],
                    'extensions' => YII_DEBUG ? [
                        '\Twig_Extension_Debug',
                    ] : [
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
                    'logFile' => 'log/' . date('Y/m/d') . '.log'
                ],
                /*[
                    'class' => 'yii\log\FileTarget',
                    'levels' => ['info'],
                    'logFile' => 'log/' . date('Y/m/').'db_'.date('d') . '.log',
                    'categories' => [
                        'yii\db\*',
                    ],
                ],*/
            ],
        ],
        'conversion' => [
            'class' => 'common\components\Conversion',
            'cache_duration' => 7200
        ],
        'balanceCalc' => [
            'class' => 'common\components\BalanceCalc',
        ],
        'logger' => [
            'class' => 'common\components\Logger',
        ],
        'messageParcer' => [
            'class' => 'common\components\MessageParser',
        ],
        'i18n' => [
            'translations' => [
                'account*' => [
                    'class' => 'yii\i18n\PhpMessageSource',
                    'basePath' => '@frontend/language',
                ],
                'common*' => [
                    'class' => 'yii\i18n\PhpMessageSource',
                    'basePath' => '@frontend/language',
                ],
                'dictionary*' => [
                    'class' => 'yii\i18n\PhpMessageSource',
                    'basePath' => '@frontend/language',
                ],
                'main*' => [
                    'class' => 'yii\i18n\PhpMessageSource',
                    'basePath' => '@frontend/language',
                ],
                'shop*' => [
                    'class' => 'yii\i18n\PhpMessageSource',
                    'basePath' => '@frontend/language',
                ],
            ]
        ],
        'languageDetector' => [
            'class' => 'common\components\LanguageDetect',
        ],
        'reCaptcha' => array_merge([
            'name' => 'reCaptcha',
            'class' => 'himiklab\yii2\recaptcha\ReCaptcha',
        ], $reCaptcha),
        'queue' => [
            'class' => \yii\queue\file\Queue::class,
            'path' => '@console/runtime/queue',
            'as log' => \yii\queue\LogBehavior::class,
        ],
      //'db' => require __DIR__.'/db.php'
    ],
    'params' => [
        'dictionary' => $dict,
    ]
];

if (YII_DEBUG) {
  // configuration adjustments for 'dev' environment
  $config['bootstrap'][] = 'debug';
  $config['modules']['debug'] = [
      'class' => 'yii\debug\Module',
      'allowedIPs' => ['*'],
      'panels' => [
          'queue' => \yii\queue\debug\Panel::className(),
      ],
  ];
  $config['bootstrap'][] = 'gii';
  $config['modules']['gii'] = [
      'class' => 'aayaresko\gii\Module',
      'allowedIPs' => ['127.0.0.1', '::1', '192.168.0.*', '192.168.1.*', '82.202.204.89'],
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
