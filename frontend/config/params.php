<?php
use zxbodya\yii2\elfinder\TinyMceElFinder;

$data= [
  'stores_menu_accordeon_collapsed' => 1,
  'auth_page_redirect'=>[
    'affiliate-system'=>'account/affiliate',
    'offline-system'=>'account/offline',
    'webmaster'=>'account/webmaster'
  ],
];


$data['TinyMce']=[
  /*'fileManager' => [
      'class' => TinyMceElFinder::className(),
      'connectorRoute' => '/manager/elfinder',
  ],*/
    'fileManager' => [
        'class' => \dominus77\tinymce\components\MihaildevElFinder::className(),
    ],
    'options' => [
        'rows' => 6
    ],
    'language' => 'ru',
  'clientOptions'=>[
    'height'=>500,
    'theme'=> 'modern',
    'relative_urls'=>false,
    'remove_script_host'=>false,
    'document_base_url'=>"https://secretdiscounter.ru/",
    'forced_root_block'=>false,
    'plugins'=> [
      'advlist','autolink','lists','link','image','charmap','hr','anchor','pagebreak','accordion','clear_br',
      'searchreplace wordcount visualblocks visualchars code fullscreen',
      'insertdatetime media nonbreaking save table contextmenu directionality',
      'emoticons template paste textcolor colorpicker textpattern imagetools'
    ],
    'external_plugins'=> [
      'accordion'=> '/plugins/tinymce/accordion/plugin.min.js',
      'clear_br'=> '/plugins/tinymce/clear_br/plugin.min.js',
    ],
    'toolbar1'=> 'undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | media | forecolor backcolor | accordion | clear_br | code help ',
    'image_advtab'=> true,
    'content_css'=> "/plugins/tinymce/content.css",
    'style_formats'=>[
      [ 'title'=> 'Headers',
        'items'=> [
          [ 'title'=> 'h1', 'block'=> 'h1' ],
          [ 'title'=> 'h2', 'block'=> 'h2' ],
          [ 'title'=> 'h3', 'block'=> 'h3' ],
          [ 'title'=> 'h4', 'block'=> 'h4' ],
          [ 'title'=> 'h5', 'block'=> 'h5' ],
          [ 'title'=> 'h6', 'block'=> 'h6' ]
        ]
      ],
      [
        'title'=> 'Blocks',
        'item'=> [
          [ 'title'=> 'p', 'block'=> 'p' ],
          [ 'title'=> 'div', 'block'=> 'div' ],
          [ 'title'=> 'pre', 'block'=> 'pre' ]
        ]
      ],
    ]
  ]
];/**/

return $data;
