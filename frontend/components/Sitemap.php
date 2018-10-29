<?php
namespace frontend\components;

use yii;

class Sitemap
{

    protected $map = [
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
        [
            'model' => 'frontend\modules\stores\models\CategoriesStores',
            'priority' => 1,
            'condition' => ['is_active' => 1],
            'select' => ['route', 'updated_at'],
            'url' => '/stores/{{route}}',
            'friquency' => 'daily'
        ],
        [
            'model' => 'frontend\modules\stores\models\Stores',
            'priority' => 1,
            'condition' => ['is_active' => [0, 1]],
            'select' => ['route', 'updated_at'],
            'url' => '/stores/{{route}}',
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
            //купоны шопа - только для шопов, имеющих купоны, 2 url
            'model' => 'frontend\modules\stores\models\Stores',
            'priority' => 1,
            'join' => ['cw_coupons cwc', 'cwc.store_id = cw_stores.uid'],
            'condition' => ['and', ['cw_stores.is_active' => [0, 1]], ['is not', 'cwc.uid', null]],
            'select' => ['route', 'cw_stores.updated_at'],
            'url' => [
                ['url' => '/coupons/{{route}}', 'priority' => 1, 'friquency' => 'daily'],
                ['url' => '/coupons/{{route}}/expired', 'priority' => 1, 'friquency' => 'daily']
            ],
            'friquency' => 'daily'
        ],
        [
            //купоны пока ограничить по времени
            'model' => 'frontend\modules\coupons\models\Coupons',
            'priority' => 1,
            'join' => ['cw_stores cws', 'cws.uid = cw_coupons.store_id'],
            'condition' => ['and',['cws.is_active' => [0, 1]], ['>', 'cw_coupons.date_end', '2018-10-01']],
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
    protected $languages = [];
    protected $url;
    protected $out = [];

    public function __construct()
    {
        $region = Yii::$app->params['regions_list'][Yii::$app->params['region']];
        $this->url = (isset($region['protocol'])? $region['protocol'] : 'http').'://'.$region['url'];

        foreach ($region['langList'] as $key => $language) {
            $this->languages[] = $language == Yii::$app->params['base_lang'] ? '' : '/'. $key;
        }
    }



    public function getMap()
    {
        $cacheName = 'sitemap_xml';
        $cache = Yii::$app->cache;
        return $cache->getOrSet($cacheName, function () {

            foreach ($this->map as $mapItem) {
                $priority = isset($mapItem['priority']) ? $mapItem['priority'] : 1;
                $friquency = isset($mapItem['friquency']) ? $mapItem['friquency'] : 'daily';
                if (isset($mapItem['model'])) {
                    $model = $mapItem['model'];
                    $itemUrl = $mapItem['url'];

                    $model = $model::find()->asArray();
                    if (!empty($mapItem['condition'])) {
                        $model->where($mapItem['condition']);
                    }
                    if (!empty($mapItem['join'])) {
                        $model->leftJoin($mapItem['join'][0], $mapItem['join'][1]);
                    }
                    if (!empty($mapItem['select'])) {
                        $model->select($mapItem['select']);
                    }
                    $model = $model->all();

                    foreach ($model as $item) {
                        $lastMod = isset($item['updated_at']) ? $item['updated_at'] : date('Y-m-d', time() - 3600 * 24 * 7);

                        $url = $itemUrl;

                        if (is_array($url)) {
                            foreach ($url as $urlItem) {
                                $urlPriority = isset($urlItem['priority']) ? $urlItem['priority'] : $priority;
                                $urlFriquency = isset($urlItem['friquency']) ? $urlItem['friquency'] : $friquency;
                                $updated = isset($urlItem['updated']) ? $urlItem['updated'] : $lastMod;
                                $this->addByUrl($item, $urlItem['url'], $updated, $urlPriority, $urlFriquency);
                            }
                        } else {
                            $this->addByUrl($item, $url, $lastMod, $priority, $friquency);
                        }

                    }
                } elseif (isset($mapItem['url'])) {
                    $updated = date('Y-m-d');
                    if (isset($mapItem['updated_request'])) {
                        $row = Yii::$app->db->createCommand($mapItem['updated_request'])->queryOne();
                        if ($row) {
                            $updated = $row['updated_at'];
                        }
                    }
                    $this->addByUrl([], $mapItem['url'], $updated, $priority, $friquency);

                }
            }
            return $this->out;
        });
    }

    protected function addByUrl($item, $url, $lastMod, $priority, $friquency)
    {
        foreach ($item as $key => $value) {
            $url = str_replace('{{'.$key.'}}', $value, $url);
        }
        if (!empty($mapItem['replaces']) && isset($mapItem['replaces'][$url])) {
            $url = $mapItem['replaces'][$url];
        }
        foreach ($this->languages as $lang) {
            $urlFinal = $this->url . $lang . $url;
            $this->out[] = [
                'loc' => $urlFinal,
                'changefreq' => $friquency,
                'priority' => $priority,
                'lastmod' => gmDate(\DateTime::W3C, strtotime($lastMod)),
            ];
        }
    }

}