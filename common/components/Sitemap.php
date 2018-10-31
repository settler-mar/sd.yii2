<?php
namespace common\components;

use yii;

class Sitemap
{
    protected $languages = [];
    protected $url;
    protected $out = '';
    protected $map;
    protected $count = 0;
    protected $fileName;
    protected $fileIndex = 0;
    protected $files;
    protected $itemCount = 0;
    protected $fileCount = 49500;
    protected $baseLang;

    /**
     * @param $map
     * @param $region
     * @param string $baseLang
     */
    public function __construct($map, $regions, $baseLang = 'ru-RU')
    {
        $this->map = $map;
        $this->regions = $regions;
        $this->baseLang = $baseLang;
    }

    public function getMaps($file)
    {
        $out = [];
        foreach ($this->regions as $key => $region) {
            $this->fileName = $file.'.'.$key;
            $this->fileIndex = 0;

            $this->url = (isset($region['protocol'])? $region['protocol'] : 'http').'://'.
                (isset($region['url']) ? $region['url'] : $key);

            $this->languages = [];
            foreach ($region['langList'] as $langKey => $language) {
                if (!in_array($langKey, $region['langListActive'])) {
                    continue;
                }
                $this->languages[] = $language == $this->baseLang ? '' : '/'. $langKey;
            }
            $out[]  = $this->getMap();
        }
        return $out;
    }

    /**
     * @param $fileName
     * @return mixed
     * @throws yii\db\Exception
     */
    protected function getMap()
    {
        $this->clear();
        $this->files = [];
        $this->startFile();

        foreach ($this->map as $mapItem) {
            $this->itemCount = 0;
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
        $this->endFile();
        $this->writeResult();
        return $this->files;
    }

    protected function clear()
    {
        $dir = dirname($this->fileName);
        $files = scandir($dir);
        $fileName = substr($this->fileName, strlen($dir)+1);
        foreach ($files as $file) {
            if (strpos($file, $fileName) === 0 && strpos($file, 'bak') === false) {
                unlink($dir.'/'.$file);
            }
        }
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
            $this->count++;
            $this->itemCount++;
            $this->out .= '<url>'.
                '<loc>'.$urlFinal.'</loc>'.
                '<lastmod>'.gmDate(\DateTime::W3C, strtotime($lastMod)).'</lastmod>'.
                '<changefreq>'.$friquency.'</changefreq>'.
                '<priority>'.$priority.'</priority>'.
                '</url>';
            if ($this->count >= $this->fileCount) {
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
        $this->files[] = $this->url.'/'.basename($fileName);
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