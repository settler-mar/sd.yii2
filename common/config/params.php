<?php
$params = [
  'user.passwordResetTokenExpire' => 3600,
  //'scriptVersion'=>YII_DEBUG?'':'.min.'.file_get_contents(__DIR__.'/script_version.data').'.',
  'scriptVersion'=>YII_DEBUG?'' : '.min.',
  'exportDir' => 'export',
  'cashback_render'=>[
      'store'=>[ //используется в карточке шопа
        'show_charity' => true,
        'view'  => 'shop'
      ]
  ],
  'currencies' => [
      'RUB' => [
          'text' => 'руб',
          //'icon' => '<span class="fa fa-rub"></span>',
          //'icon' => "{{ svg('ruble', 'currency-icon-ruble')|raw }}",
          'svg' => 'ruble'
      ],
      'USD' => [
          'text' => 'usd',
          'icon' => '<span class="fa fa-usd"></span>',
          'svg' => 'dollar',
      ],
      'EUR' => [
          'text' => 'eur',
          'icon' => '<span class="fa fa-eur"></span>',
          'svg' => 'euro',
      ],
      'KZT' => [
          'text' => 'kzt',
          'icon' => 'kzt',
      ],
      'UAH' => [
          'text' => 'грн',
          'icon' => 'грн',
      ],
      'BYN' => [
          'text' => 'бел.руб',
          'icon' => 'бел.руб',
      ],
      'GBP' => [
          'text' => 'gbp',
          'icon' => 'gbp',
      ],
      'INR' => [
          'text' => 'INR',
          'icon' => 'INR',
      ],
      'TRY' => [
          'text' => 'TRY',
          'icon' => 'TRY',
      ],
  ],
  'regions_list' => require(__DIR__ . '/regions.config-local.php'),

  'rating_calculate_interval' => 12,

  'configs' => [
      'sellaction' => [
          'config' => 'sellaction_categories.json',
          'title' => 'Категории Sellaction',
      ],
      'rakuten' => [
          'config' => 'rakute_categories.json',
          'title' => 'Категории Rakuten',
      ],
      'cj.com' => [
          'config' => 'cjcom_categories.json',
          'title' => 'Категории Cj.com',
      ],
      'webgains' => [
          'config' => 'webgains_categories.json',
          'title' => 'Категории Webgains',
      ]
  ],
  'valuta'=>"RUB",
];

$params['valuta_list']=array_keys($params['currencies']);

$params['valuta_list_dp']=[];
foreach ($params['currencies'] as $k=>$valuta){
  $params['valuta_list_dp'][$k]=$valuta['text'];
}
return $params;