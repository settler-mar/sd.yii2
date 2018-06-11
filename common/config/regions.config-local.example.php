<?php

return [
    'default'=>[
        'name'=>'СНГ',
        'url'=>'127.0.0.1:8080',
        'protocol'=>'http',
        'langList'=>['ru'=>'ru-RU','en'=>'en-EN'],
        'langDefault'=>'ru',
        'params'=>[
            'valuta'=>'RUB',
        ],
        'socialsShareList' => '1,0,2,4,3,5,6',//vk,fb,ok,g+,tw,mali.ru,lj
        'active' => 1,
    ],
    'usa.secretdiscounter.com'=>[
        'name'=>'USA',
        'langList'=>['en'=>'en-EN'],
        'langDefault'=>'en',
        'params'=>[
            'valuta'=>'USD',
        ],
        'socialsShareList' => '0,4,3,6',//fb,g+,tw,lj
        'active' => 1,
    ]
];