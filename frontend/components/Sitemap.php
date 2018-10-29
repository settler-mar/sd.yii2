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
            'select' => ['page'],
            'url' => '/{{page}}',
            'replaces' => [
                '/index' => '',
            ],
        ],
        [
            'model' => 'frontend\modules\stores\models\CategoriesStores',
            'priority' => 1,
            'condition' => ['is_active' => 1],
            'select' => ['route'],
            'url' => '/stores/{{route}}',
        ],
        [
            'model' => 'frontend\modules\stores\models\Stores',
            'priority' => 1,
            'condition' => ['is_active' => [0, 1]],
            'select' => ['route'],
            'url' => '/stores/{{route}}',
        ]
    ];
    protected $languages = [];
    protected $url;

    public function __construct()
    {
        $region = Yii::$app->params['regions_list'][Yii::$app->params['region']];
        $this->url = (isset($region['protocol'])? $region['protocol'] : 'http').'://'.$region['url'];

        foreach ($region['langList'] as $key => $language) {
            $this->languages[] = $language == Yii::$app->params['base_lang'] ? '' : '/'. $key;
        }
    }



    public function getXml()
    {
        $cacheName = 'sitemap_xml';
        $cache = Yii::$app->cache;
        return $cache->getOrSet($cacheName, function () {
            $out = '<?xml version="1.0" encoding="UTF-8"?>'."\n".
                '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'."\n";

            foreach ($this->map as $mapItem) {
                $model = $mapItem['model'];
                $priority = isset($mapItem['priority']) ? $mapItem['priority'] : 1;
                $itemUrl = $mapItem['url'];

                $model = $model::find()->asArray();
                if (!empty($mapItem['condition'])) {
                    $model->where($mapItem['condition']);
                }
                $model = $model->all();

                foreach ($model as $item) {
                    $lastMod = isset($item['updated_at']) ? $item['updated_at'] : date('Y-m-d', time()- 3600 * 24 * 7);

                    $url = $itemUrl;
                    foreach ($item as $key => $value) {
                        $url = str_replace('{{'.$key.'}}', $value, $url);
                    }
                    if (!empty($mapItem['replaces']) && isset($mapItem['replaces'][$url])) {
                        $url = $mapItem['replaces'][$url];
                    }
                    foreach ($this->languages as $lang) {
                        $urlFinal = $this->url . $lang . $url;
                        $out .= '<url><loc>' . $urlFinal . '</loc>' ."\n".
                            '<lastmod>' . $lastMod . '</lastmod>' ."\n".
                            '<changefreq>monthly</changefreq>' ."\n".
                            '<priority>' . $priority . '</priority>' ."\n".
                            '</url>'."\n";
                    }
                }
            }
            $out .= '</urlset>'."\n";
            return $out;
        });
    }

}