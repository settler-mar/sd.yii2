<?php

return [
    'ru'=>[
        'name'=>'RU',
        'url'=>'127.0.0.1:8080',
        'protocol'=>'http',
        'langList'=>['ru'=>'ru-RU','en'=>'en-EN'],
        'langListActive' => ['ru', 'en'],
        'langDefault'=>'ru',
        'params'=>[
            'valuta'=>'RUB',
        ],
        'socialsShareList' => '1,0,2,4,3,5,6',//vk,fb,ok,g+,tw,mali.ru,lj
        'active' => 1,
        'areas' => ['ru', 'bl', 'kz', 'ua'],
    ],
    'en'=>[
        'name'=>'USA',
        'langList'=>['en'=>'en-EN'],
        'langListActive' => ['en'],
        'langDefault'=>'en',
        'params'=>[
            'valuta'=>'USD',
        ],
        'socialsShareList' => '0,4,3,6',//fb,g+,tw,lj
        'active' => 1,
        'areas' => ['us', 'eu', 'uk', 'au'],
    ]
];