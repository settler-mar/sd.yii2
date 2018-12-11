<?php

namespace console\controllers;


use common\models\Actionpay;
use frontend\modules\stores\models\Cpa;
use frontend\modules\stores\models\Stores;
use frontend\modules\stores\models\CpaLink;
use frontend\modules\product\models\CatalogStores;
use yii\console\Controller;
use common\models\Impact;
use yii\helpers\Console;
use shop\modules\product\models\Product;
use frontend\modules\cache\models\Cache;
use yii;

class ImpactController extends Controller
{

    protected $cpaLink;

    public function init()
    {
        if (Console::isRunningOnWindows()) {
            shell_exec('chcp 65001');
        }

        $cpa = Cpa::findOne(['name' => 'Impact']);
        $store = Stores::findOne(['route' => 'impact-com']);
        $this->cpaLink = $cpa && $store ? CpaLink::findOne(['cpa_id' => $cpa->id, 'stores_id' => $store->uid]) : false;
        if (!$this->cpaLink) {
            ddd('There is not cpaLink for cpa Impact and store Impact.com');
        }
        return parent::init();
    }

    public function actionCatalog()
    {
        $service = new Impact();
        $catalog = $service->getCatalogList();
        foreach ($catalog as $catalogItem) {
            /*
            public catalogId -> string (4) "4061"
            public name -> string (17) "Target Exclusions" -
            public size -> string (4) "1 MB"
            public format -> string (2) "IR"
            public numRecords -> string (4) "5050"
            public lastUpdated -> string (25) "2018-12-06T23:49:59-08:00"
            public location -> string (35) "/Target/Target-Exclusions_IR.txt.gz"
            public advertiserId -> string (5) "59720"
            public campaignId -> string (4) "2092"
             */
            //d($catalogItem);
            //$catalogItem->name не уникально, поэтому
            $name = explode('.', basename((string) $catalogItem->location));
            $name = isset($name[0]) ? $name[0] : $catalogItem->name;
            $catalog_db = CatalogStores::find()
                ->where([
                    'cpa_link_id' => $this->cpaLink->id,
                    'name' => $name,
                ])
                ->one();
            if (!$catalog_db) {
                $catalog_db = new CatalogStores();
                $catalog_db->cpa_link_id = $this->cpaLink->id;
                $catalog_db->name = $name;
                $catalog_db->active = 2;
            }
            $d = strtotime($catalogItem->lastUpdated);
            $catalog_db->date_download = date("Y-m-d H:i:s", $d);
            $catalog_db->csv = (string) $catalogItem->location;

            if (!$catalog_db->save()) {
                d($catalog_db->errors, $catalog_db->attributes);
            }
        }

    }


    /**
     * Обновление каталога продуктов
     *
     */
    public function actionProduct()
    {
        Yii::$app->cache->flush();
        Yii::$app->params['cash'] = false;

        $config = isset(Yii::$app->params['products_import']) ? Yii::$app->params['products_import'] : false;

        $service = new Impact();

        $links = CatalogStores::find()

            ->where([
                'and',
                'active=' . CatalogStores::CATALOG_STORE_ACTIVE_YES,
                ['or',
                    '`date_import`=`crated_at`',
                    '`date_import`<`date_download`',
                    ['date_import' => null],
                    ['product_count' => null],
                ],
                ['cpa_link_id' => $this->cpaLink->id]
            ])->all();

        if (!$links) {
            echo "There ara no catalogs for refresh";
            return;
        }
        foreach ($links as $link) {
            $dateUpdate = time();//запомнили дату обращения за каталогом
            $csv = $service->getCatalog($link->csv, $config['refresh_csv']);
            echo "Catalog " . $link->id . ":" . $link->name . " from CpaLink " . $link->cpa_link_id . "\n";
            $link->product_count = $this->writeCatalog($csv, $link);
            $link->date_import = date('Y-m-d H:i:s', $dateUpdate);
            $link->save();
            if ($config['refresh_csv']) {
                $service->unlink($link->csv);
            }
        }
    }


    protected function writeCatalog($txt, $catalog)
    {
        $count = 0;
        $insert = 0;
        $error = 0;

        if (!$txt) {
            return 0;
        }
        $delimiter = "\t";
        try {
            if (($handle = fopen($txt, "r")) !== false) {
                $headers = fgetcsv($handle, 0, $delimiter);

                $photoPath = $this->cpaLink->affiliate_id . '/' . $catalog->id . '/';
                $catalogCount = Product::find()->where(['catalog_id' => $catalog->id])->count();
                $store = $catalog->cpaLink->store->toArray();
                $store_id = $store['uid'];
                Cache::deleteName('catalog_stores_used');
                Cache::deleteName('stores_used_by_catalog');

                $start_mem = memory_get_peak_usage();


                while (($row = fgetcsv($handle, 0, $delimiter)) !== false) {
                    if (count($headers) != count($row)) {
                        //таких немного, можно пропустить
                        continue;
                    }
                    $product = array_combine($headers, $row);

                  d($product);
                  $lang = Yii::$app->languageDetector->detect($product['Description'] . $product['Title']);
                  if(!in_array($lang,['en','ru'])){
                    //Пропускать только раздрешенные языки
                    continue;
                  }

                  $count++;
                  if ($count % 100 == 0) {
                        if ($start_mem < memory_get_peak_usage()) {
                            gc_collect_cycles();
                            $start_mem = memory_get_peak_usage();
                            echo "    memory usage " . number_format(memory_get_peak_usage()) . "\n";
                        }
                        echo date('Y-m-d H:i:s', time()) . ' ' . $count . "\n";
                    }
                    if ($count>10) {
                        break;
                    }
                }
                fclose($handle);

                echo date('Y-m-d H:i:s', time()) . ' ' . $count . " memory usage " . number_format(memory_get_peak_usage()) . "\n";

                Cache::deleteName('product_category_menu');
                Cache::clearName('catalog_product');
                Cache::deleteName('products_active_count');

                echo 'Products ' . $count . "\n";
                echo 'Inserted ' . $insert . "\n";
                if ($error) {
                    echo 'Errors ' . $error . "\n";
                }

            } else {
                d('File not found. ' . $txt);
            }
        } catch (\Exception $e) {
            d('Ошибка при загрузке файла ' . $txt . ' ' . $e->getMessage());
        }
        return $count;
    }
}