<?php
return [
    'products_import' => [
        'refresh_csv' => true,//false,//если false то csv не обновлятеся
        'image_size' => 600,//размер картинок
        'image_download_time' => 5,//минут задача, потом прерывается
        'stores_only' => [], //['14827', '6115'],//если задано, то грузить только эти шопы
        'image_optimize' => 1,//оптимизация картинок
    ],
    'sitemap' => [
        'path' => 'sitemap',
        'file' => 'sitemap',
        'site_url' => 'https://secretdiscounter.com',
        'file_count' => 49500,
    ]

];
