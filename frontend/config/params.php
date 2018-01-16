<?php
use zxbodya\yii2\elfinder\TinyMceElFinder;

return [
  'stores_menu_accordeon_collapsed' => 1,
  'auth_page_redirect'=>[
    'affiliate-system'=>'account/affiliate',
    'offline-system'=>'account/offline',
    'webmaster'=>'account/webmaster'
  ],
  'TinyMce'=>[
    'fileManager' => [
        'class' => TinyMceElFinder::className(),
        'connectorRoute' => '/el-finder/connector',
    ],
  ]
];
