<?php
use zxbodya\yii2\elfinder\TinyMceElFinder;

$data = [
    'stores_menu_accordeon_collapsed' => 1,
    'stores_menu_separate' => 0,
    'stores_menu_abc' => 0,//выводить в меню алфавитный поиск
    'coupons_menu_abc' => 0,//выводить в меню алфавитный поиск
    'auth_page_redirect' => [
        'affiliate-system' => 'account/affiliate',
        'offline-system' => 'account/offline',
        'webmaster' => 'account/webmaster'
    ],
    'pathToScript' => require __DIR__ . '/path_scripts.php',
    'coupons_languages_arrays' => [
        'ru' => ['ru', 'bg', 'sr', 'uk', 'mk', 'ro'],//русский болгарский и т.д.
        'en' => ['en', 'la'],//английский латинский
    ],
];


$data['TinyMce'] = [
    'fileManager' => [
        'class' => \dominus77\tinymce\components\MihaildevElFinder::className(),
    ],
    'options' => [
        'rows' => 6
    ],
    'language' => 'ru',
    'clientOptions' => [
        'height' => 500,
        'theme' => 'modern',
        'relative_urls' => false,
        'remove_script_host' => false,
        'document_base_url' => "https://secretdiscounter.ru/",
        'forced_root_block' => false,
        'plugins' => [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'hr', 'anchor', 'pagebreak', 'accordion', 'clear_br',
            'searchreplace wordcount visualblocks visualchars code fullscreen',
            'insertdatetime media nonbreaking save table contextmenu directionality',
            'emoticons template paste textcolor colorpicker textpattern imagetools'
        ],
        'external_plugins' => [
            'accordion' => '/plugins/tinymce/accordion/plugin.min.js',
            'clear_br' => '/plugins/tinymce/clear_br/plugin.min.js',
        ],
        'toolbar1' => 'undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | media | forecolor backcolor | accordion | clear_br | code help ',
        'image_advtab' => true,
        'content_css' => "/plugins/tinymce/content.css",
        'style_formats' => [
            ['title' => 'Headers',
                'items' => [
                    ['title' => 'h1', 'block' => 'h1'],
                    ['title' => 'h2', 'block' => 'h2'],
                    ['title' => 'h2 title-no-line', 'block' => 'h2', 'classes'=>'title-no-line'],
                    ['title' => 'h2 title-no-line align-left', 'block' => 'h2', 'classes'=>'title-no-line align-left'],
                    ['title' => 'h3', 'block' => 'h3'],
                    ['title' => 'h4', 'block' => 'h4'],
                    ['title' => 'h5', 'block' => 'h5'],
                    ['title' => 'h6', 'block' => 'h6']
                ],
            ],
            [
                'title' => 'Blocks',
                'items' => [
                    ['title' => 'p', 'block' => 'p'],
                    ['title' => 'div', 'block' => 'div'],
                    ['title' => 'pre', 'block' => 'pre']
                ]
            ],
        ]
    ]
];/**/

return $data;
