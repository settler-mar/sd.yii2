<?php
namespace common\components;

use yii;

class Sitemap
{
    protected $config = [
        'path' => 'sitemap',
        'file' => 'sitemap',
        'file_count' => 49500,
    ];
    protected $prefixes = [];
    protected $url = 'https://secretdiscouner.com';
    protected $out = '';
    protected $map;
    protected $count = 0;
    protected $fileName;
    protected $fileIndex = 0;
    protected $files;
    protected $itemCount = 0;
    protected $replaces;
    protected $methods;

    /**
     * @param $map
     * @param $region
     * @param string $baseLang
     */
    public function __construct($map)
    {
        $this->map = $map;
        if (isset(Yii::$app->params['sitemap'])) {
            $this->config = Yii::$app->params['sitemap'];
            $this->url = isset($this->config['site_url']) ? $this->config['site_url'] :
                $this->url;
        }

        foreach (Yii::$app->params['regions_list'] as $key => $regionItem) {
            foreach ($regionItem['langList'] as $langKey => $langActive) {
                if (in_array($key, $regionItem['langListActive'])) {
                    $conditions = [];
                    //условия для запросов по отдельным префиксам
                    if (isset(Yii::$app->params['coupons_languages_arrays'][$langKey])) {
                        $conditions['coupon_languages'] = Yii::$app->params['coupons_languages_arrays'][$langKey];
                    }
                    $this->prefixes[] = [
                        'prefix' => $key . ($langKey == $regionItem['langDefault'] ? '' :  '-' . $langKey),
                        'region' => $key,
                        'language' => $regionItem['langList'][$langKey],
                        'lang_code' => $langKey,
                        'conditions' => $conditions,
                    ];
                }
            }
        }
    }

    public function getMaps($alias)
    {
        $this->clear($alias);
        $out = [];
        $path = $alias.'/'.$this->config['path'];
        if (!file_exists($path)) {
            mkdir($path);
        }
        $this->fileName = $path.'/'.$this->config['file'];
        $this->fileIndex = 0;

        $out[]  = $this->getMap();
        return $out;
    }

    /**
     * @param $fileName
     * @return mixed
     * @throws yii\db\Exception
     */
    protected function getMap()
    {
        $this->files = [];
        $this->startFile();

        foreach ($this->map as $mapItem) {
            $this->replaces = isset($mapItem['replaces']) ? $mapItem['replaces'] : [];
            $this->methods = isset($mapItem['methods']) ? $mapItem['methods'] : [];
            $this->itemCount = 0;
            $priority = isset($mapItem['priority']) ? $mapItem['priority'] : 1;
            $friquency = isset($mapItem['friquency']) ? $mapItem['friquency'] : 'daily';
            if (isset($mapItem['model'])) {
                $itemUrl = $mapItem['url'];

                $requestItems = [1];
                if (!empty($mapItem['lang_request'])) {
                    //для каждого языка свой запрос
                    $requestItems = $this->prefixes;
                }
                foreach ($requestItems as $requestItem) {
                    $model = $mapItem['model'];
                    $model = $model::find();

                    $conditions = isset($mapItem['condition']) ? $mapItem['condition'] : false;
                    if ($conditions && isset($requestItem['conditions'])) {
                        //Условия для запроса по языкам
                        foreach ($requestItem['conditions'] as $key => $value) {
                            foreach ($conditions as &$condition) {
                                if ($condition === '{{' . $key . '}}') {
                                    $condition = $value;
                                }
                            }
                        }
                    }

                    if (!empty($conditions)) {
                        $model->where($conditions);
                    }
                    if (!empty($mapItem['join'])) {
                        foreach ($mapItem['join'] as $join) {
                            $model->leftJoin($join[0], $join[1]);
                        }
                    }
                    if (!empty($mapItem['select'])) {
                        $model->select($mapItem['select']);
                    }
                    if (!empty($mapItem['group_by'])) {
                        $model->groupBy($mapItem['group_by']);
                    }
                    if (!isset($mapItem['asArray']) || $mapItem['asArray'] !== false) {
                        $model->asArray();
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
                                $this->addByUrl(
                                    $item,
                                    $urlItem['url'],
                                    $updated,
                                    $urlPriority,
                                    $urlFriquency,
                                    $requestItem == 1 ? null : [$requestItem]
                                );
                            }
                        } else {
                            $this->addByUrl(
                                $item,
                                $url,
                                $lastMod,
                                $priority,
                                $friquency,
                                $requestItem == 1 ? null : [$requestItem]
                            );
                        }

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
        $this->endFile();
        $this->writeResult();
        return $this->files;
    }

    protected function clear($alias)
    {
        $dir = $alias.'/'.$this->config['path'];
        if (!file_exists($dir)) {
            return;
        }
        $files = scandir($dir);
        foreach ($files as $file) {
            if (strpos($file, $this->config['file']) === 0) {
                unlink($dir.'/'.$file);
            }
        }
    }


    protected function addByUrl($item, $url, $lastMod, $priority, $friquency, $prefixes = null)
    {
        //замена ключей в пути полями
        foreach ($item as $key => $value) {
            $url = str_replace('{{'.$key.'}}', $value, $url);
        }
        //замена ключей в пути результатами методов модели
        foreach ($this->methods as $key => $method) {
            if (method_exists($item, $method['method'])) {
                $methodName = $method['method'];
                $value = $item->$methodName(isset($method['argument']) ? $method['argument'] : null);
                if (is_string($value)) {
                    $url = str_replace('{{' . $key . '}}', $value, $url);
                }
            }
        }
        //исключения для url (используем для meta)
        if (isset($this->replaces[$url]) && $this->replaces[$url] === null) {
            return;
        }
        //замены в url
        if (!empty($this->replaces) && isset($this->replaces[$url])) {
            $url = $this->replaces[$url];
        }
        //префиксы (массив) или как аргумент, или как свойство
        $prefixes = $prefixes ? $prefixes : $this->prefixes;
        foreach ($prefixes as $prefix) {
            $urlFinal = $this->url . '/'. $prefix['prefix'] . $url;
            $this->count++;
            $this->itemCount++;
            $this->out .= '<url>'.
                '<loc>'.$urlFinal.'</loc>'.
                '<lastmod>'.gmDate(\DateTime::W3C, strtotime($lastMod)).'</lastmod>'.
                '<changefreq>'.$friquency.'</changefreq>'.
                '<priority>'.$priority.'</priority>'.
                '</url>';
            if ($this->count >= $this->config['file_count']) {
                $this->endFile();
                $this->startFile();
            }
        }
    }

    protected function startFile()
    {
        $this->count = 0;
        $this->out = '<?xml version="1.0" encoding="UTF-8"?>'.
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    }

    protected function endFile()
    {
        $this->out .= '</urlset>';
        $this->fileIndex++;
        $fileName = $this->fileName .'.'. $this->fileIndex.'.xml';
        file_put_contents($fileName, $this->out);
        $this->files[] = $this->url.'/'.$this->config['path'].'/'.basename($fileName);
    }

    protected function writeResult()
    {
        $out = '<?xml version="1.0" encoding="UTF-8"?>'.
            '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
        foreach ($this->files as $file) {
            $out .= '<sitemap>'.
                '<loc>'.$file.'</loc>'.
                '<lastmod>'.gmDate(\DateTime::W3C, time()).'</lastmod>'.
                '</sitemap>';
        }
        $out .= '</sitemapindex>';
        file_put_contents($this->fileName.'.xml', $out);
    }

}