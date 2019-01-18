<?php
return [
    'products_import' => [
        'refresh_csv' => true,//false,//если false то csv не обновлятеся
        'stores_only' => [], //['14827', '6115'],//если задано, то грузить только эти шопы
    ],
    'sitemap' => [
        'path' => 'sitemap',
        'file' => 'sitemap',
        'site_url' => 'https://secretdiscounter.com',
        'file_count' => 49500,
    ]

];
