<?php

return [
    [
        'model' => 'frontend\modules\meta\models\Meta',
        'priority' => 1,
        'condition' => ['not like', 'page', '*'],
        'select' => ['page', 'updated_at'],
        'url' => '/{{page}}',
        'replaces' => [
            '/index' => '',
        ],
        'friquency' => 'monthly'
    ],
    [   //категории шопов
        'model' => 'frontend\modules\stores\models\CategoriesStores',
        'priority' => 1,
        'join' => [
            ['cw_stores_to_categories cwstc', 'cwstc.category_id = cw_categories_stores.uid'],
            ['cw_stores cws', 'cws.uid = cwstc.store_id']
        ],
        'condition' => [
            'and',
            ['cw_categories_stores.is_active' => 1],
            ['cws.is_active' => [0,1]],
            ['cws.is_offline' => 0],
            ['is not', 'cws.uid', null]
        ],
        'select' => ['cw_categories_stores.route', 'cw_categories_stores.updated_at'],
        'group_by' => ['cw_categories_stores.route', 'cw_categories_stores.updated_at'],
        'url' => '/stores/{{route}}',
        'friquency' => 'daily'
    ],
    [   //категории шопов offline
        'model' => 'frontend\modules\stores\models\CategoriesStores',
        'join' => [
            ['cw_stores_to_categories cwstc', 'cwstc.category_id = cw_categories_stores.uid'],
            ['cw_stores cws', 'cws.uid = cwstc.store_id']
        ],
        'priority' => 1,
        'condition' => [
            'and',
            ['cw_categories_stores.is_active' => 1],
            ['cws.is_active' => [0,1]],
            ['cws.is_offline' => 1],
            ['is not', 'cws.uid', null]
        ],
        'select' => ['cw_categories_stores.route', 'cw_categories_stores.updated_at'],
        'group_by' => ['cw_categories_stores.route', 'cw_categories_stores.updated_at'],
        'url' => '/stores/{{route}}-offline',
        'friquency' => 'daily'
    ],
    [
        //шопы
        'model' => 'frontend\modules\stores\models\Stores',
        'priority' => 1,
        'condition' => ['and', ['is_active' => [0, 1]], ['is_offline' => 0]],
        'select' => ['route', 'updated_at'],
        'url' => '/stores/{{route}}',
        'friquency' => 'daily'
    ],
    [
        //шопы offline
        'model' => 'frontend\modules\stores\models\Stores',
        'priority' => 1,
        'condition' => ['and', ['is_active' => [0, 1]], ['is_offline' => 1]],
        'select' => ['route', 'updated_at'],
        'url' => '/stores/{{route}}-offline',
        'friquency' => 'daily'
    ],
    [
        'model' => 'frontend\modules\coupons\models\CategoriesCoupons',
        'priority' => 1,
        'select' => ['route', 'updated_at'],
        'url' => '/coupons/{{route}}',
        'friquency' => 'daily'
    ],
    [
        //купоны шопа - 2 url
        'model' => 'frontend\modules\stores\models\Stores',
        'priority' => 1,
        'join' => [['cw_coupons cwc', 'cwc.store_id = cw_stores.uid']],
        'condition' => ['and', ['cw_stores.is_active' => [0, 1]], ['is not', 'cwc.uid', null]],
        'select' => ['route', 'cw_stores.updated_at'],
        'group_by' => ['route', 'cw_stores.updated_at'],
        'url' => [
            ['url' => '/coupons/{{route}}', 'priority' => 1, 'friquency' => 'daily'],
            ['url' => '/coupons/{{route}}/expired', 'priority' => 1, 'friquency' => 'daily']
        ],
        'friquency' => 'daily'
    ],
    [
        //купоны
        'model' => 'frontend\modules\coupons\models\Coupons',
        'priority' => 1,
        'join' => [['cw_stores cws', 'cws.uid = cw_coupons.store_id']],
        'condition' => ['cws.is_active' => [0, 1]],
        'select' => ['cws.route as route', 'cw_coupons.uid', 'cw_coupons.updated_at'],
        'url' => '/coupons/{{route}}/{{uid}}',
        'friquency' => 'daily'
    ],
    [
        //единичный юрл
        'url' => '/reviews',
        'updated_request' => 'select max(added) as updated_at from `cw_users_reviews`',
        'friquency' => 'daily',
        'priority' => 1,
    ]
];