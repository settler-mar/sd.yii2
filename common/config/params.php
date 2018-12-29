<?php

$params = [
  'user.passwordResetTokenExpire' => 3600,
  //'scriptVersion'=>YII_DEBUG?'':'.min.'.file_get_contents(__DIR__.'/script_version.data').'.',
  'scriptVersion'=>YII_DEBUG?'' : '.min.',
  'exportDir' => 'export',
  'country_select_active'=>false,
  'cashback_render'=>[
      'store'=>[ //используется в карточке шопа
        'show_charity' => true,
        'view'  => 'shop'
      ],
    'shop_catalog'=>[//Плитка магазина
        'show_charity' => true,
        'view'  => 'shop_catalog'
    ],
    'product_catalog'=>[//Плитка товара в каталоге
        'show_charity' => false,
        'view'  => 'product_catalog',
        'float' => true,
    ],
    'calck_cashback'=>[ //калькулятор кэшбэка
        'show_charity' => false,
        'view'  => 'calck_cashback',
        'only_number' => true,
    ],
    'search_line'=>[ // используется для результатов поиска в выпадашке
        'show_charity' => true,
        'view'  => 'search_line'
    ],
    'product'=>[ // квадратик каталога продуктов
        'show_charity' => true,
        'view'  => 'product'
    ],
    'coupon'=>[ // квадратик купона
        'show_charity' => true,
        'view'  => 'coupons_title'
    ],
    'goto'=>[ // квадратик купона
        'show_charity' => true,
        'replace_charity' => "0",
        'view'  => 'goto'
    ],
    'coupon_share'=>[ // квадратик купона тайтл для поделится
        'show_charity' => true,
        'replace_charity' => "10%",
        'view'  => 'coupons_share'
    ],
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
  'stores_menu_accordeon_collapsed' => 1,
  'stores_menu_separate' => 0,
  'stores_menu_abc' => 0,//выводить в меню алфавитный поиск
  'coupons_menu_abc' => 0,//выводить в меню алфавитный поиск
  'auth_page_redirect' => [
      'affiliate-system' => 'account/affiliate',
      'offline-system' => 'account/offline',
      'webmaster' => 'account/webmaster'
  ],
  'coupons_languages_arrays' => [
      'ru' => ['ru', 'bg', 'sr', 'uk', 'mk', 'ro'],//русский болгарский и т.д.
      'en' => ['en', 'la', 'fr', 'de', 'no', 'da', 'et', 'lt', 'sv'],//английский латинский
  ],
  'base_lang'=>'ru-RU',
  'language_list' => [
      'ru-RU'=> 'Русский',
      'en-EN'=> 'English',
      'lt'=> 'Литовский',
  ],
  'country_to_region_default_language' => 'en-EN',
  'country_to_region_default_region' => 'default',
  'login_attemps_count' => 3,
  'login_attemps_period' => 15,//минут, когда считаем попытки
  'login_attemps_block_period' => 30,//минут, время блокировки
  'product_params_stop_list' => [//при загрузке товаров такие параметры игнорировать
      'Отзывы', 'Отзыв_*', 'Группа товаров',
  ],
  'product_params_values_max_length' => 64,//при загрузке товаров максимальная длина значения параметра
  'shop_export_csv_except_routes' => ['aliexpress-tmall', 'tmall-aliexpress-com'],//при экспорте в csv эти шопы не выводятся
];

$params['valuta_list']=array_keys($params['currencies']);

$params['valuta_list_dp']=[];
foreach ($params['currencies'] as $k=>$valuta){
  $params['valuta_list_dp'][$k]=$valuta['text'];
}
return $params;