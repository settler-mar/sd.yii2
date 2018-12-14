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

    protected $cpaId;
    protected $delimiter = "\t";
    protected $config;
    protected $refresh_csv;
    protected $error = false;
    protected $format = [];
    protected $formats = [
        'GOOGLE TXT' =>[
            'fields' => [
                'id' => ['out' => ['id']],
                'name' => ['out' => ['title']],
                'description' => ['out' => ['description']],
                'price' => ['out' => ['sale_price', 'price'], 'float' => true],
                'currencyId' => ['out' => ['sale_price', 'price'], 'chars' => true],
                'oldprice' => ['out' => ['price'], 'float' => true],
                'url' => ['out' => ['link']],
                'vendor' => ['out' => ['brand']],
                'image' => ['out' => ['image_link']],
                'categories_string' => ['out' => ['google_product_category']],
            ],
            'params' => ['color', 'size', 'size_type', 'material', 'pattern', 'size_system',
                'genger', 'age_group', 'adult', 'shipping_length', 'shipping_width', 'shipping_height'],
        ],
        'CUSTOM' =>[
            'fields' => [
                'id' => ['out' => ['SKU']],
                'name' => ['out' => ['Title']],
                'description' => ['out' => ['Description']],
                'price' => ['out' => ['Price', 'Regular Price'], 'float' => true],
                'currencyId' => ['out' => []],
                'oldprice' => ['out' => ['Regular Price'], 'float' => true],
                'url' => ['out' => ['Product URL']],
                'vendor' => ['out' => ['Manufacturer']],
                'image' => ['out' => ['Image URL']],
                'categories_string' => ['out' => ['Category ID']],
            ],
            'params' => [],//['Condition'],
        ],
    ];


    public function init()
    {
        if (Console::isRunningOnWindows()) {
            shell_exec('chcp 65001');
        }

        $this->config = isset(Yii::$app->params['products_import']) ? Yii::$app->params['products_import'] : false;
        $this->refresh_csv = isset($this->config['refresh_csv']) ? $this->config['refresh_csv'] : true;

        $cpa = Cpa::findOne(['name' => 'Impact']);
        $this->cpaId = $cpa ? $cpa->id : false;
        if (!$this->cpaId) {
            ddd('There is not cpa Impact');
        }
        return parent::init();
    }

    public function actionStore()
    {
        $affiliate_list = [];
        $service = new Impact();
        $catalog = $service->getCatalogList($this->refresh_csv);
        $storesAll = 0;
        $inserted = 0;
        $insertedCpaLink = 0;
        $errors = 0;
        $errorsCpaLink = 0;
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

            $affiliate_list[] = (int)$catalogItem->campaignId;
            $fileNameArray = array_values(array_diff(explode('/', (string) $catalogItem->location), ['']));
            $name = isset($fileNameArray[0]) ? $fileNameArray[0] : (string) $catalogItem->name;

            //d($catalogItem);
            $newStore = [
                'cpa_id' => $this->cpaId,
                'affiliate_id' => (int) $catalogItem->campaignId,
                'url' => strtolower($name.'.com'),//от балды,чтобы соблюсти уникальность
                'name' => $name,
                'alias' => null,
                'currency' => 'USD',
                'cashback' => 'до 10%',
                'hold_time' => 30,
                'percent' => 50,
                'affiliate_link' => '-',
                'actions' => '',
                'hide_on_site' => 1
            ];

            //CatalogStores
            $storeResult = Stores::addOrUpdate($newStore);
            if (!$storeResult['result']) {
                $errors++;
            } else {
                if ((string) $catalogItem->format != 'IR') {
                    $name = explode('.', basename((string) $catalogItem->location));
                    $catalogName = isset($name[0]) ? $name[0] : (string) $catalogItem->name;

                    $catalog_db = CatalogStores::find()
                        ->where([
                            'cpa_link_id' => $storeResult['cpa_link']->id,
                            'name' => $catalogName,
                        ])
                        ->one();
                    if (!$catalog_db) {
                        $catalog_db = new CatalogStores();
                        $catalog_db->cpa_link_id = $storeResult['cpa_link']->id;
                        $catalog_db->name = $catalogName;
                        $catalog_db->active = 2;
                        $catalog_db->format = (string) $catalogItem->format;
                    }

                    $catalog_db->date_download = date("Y-m-d H:i:s", strtotime((string) $catalogItem->lastUpdated));
                    $catalog_db->csv = (string) $catalogItem->location;

                    $catalog_db->save();
                }
            }
            if ($storeResult['new']) {
                $inserted++;
            }
            if ($storeResult['newCpa']) {
                $insertedCpaLink++;
                if (!$storeResult['resultCpa']) {
                    $errorsCpaLink++;
                }
            }

        }

        $sql = "UPDATE `cw_stores` cws
        LEFT JOIN cw_cpa_link cpl on cpl.cpa_id=" . $this->cpaId . " AND cws.`active_cpa`=cpl.id
        SET `is_active` = '0'
        WHERE cpl.affiliate_id NOT in(" . implode(',', $affiliate_list) . ") AND is_active!=-1";
        Yii::$app->db->createCommand($sql)->execute();
        echo 'Stores ' . $storesAll . "\n";
        echo 'Inserted ' . $inserted . "\n";
        if (!empty($errors)) {
            echo 'Stores fails ' . $errors . "\n";
        }
        echo 'Inserted Cpa link ' . $insertedCpaLink . "\n";
        if (!empty($errorsCpaLink)) {
            echo 'Cpa link fails ' . $errorsCpaLink . "\n";
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

        $service = new Impact();

        $links = CatalogStores::find()
            ->from(CatalogStores::tableName(). ' cat')
            ->innerJoin(Cpalink::tableName() . ' cpalink', 'cpalink.id = cat.cpa_link_id')
            ->where([
                'and',
                'active=' . CatalogStores::CATALOG_STORE_ACTIVE_YES,
                ['or',
                    '`date_import`=`crated_at`',
                    '`date_import`<`date_download`',
                    ['date_import' => null],
                    ['product_count' => null],
                ],
                ['cpalink.cpa_id' => $this->cpaId]
            ])->all();

        if (!$links) {
            echo "There ara no catalogs for refresh";
            return;
        }
        foreach ($links as $link) {
            $dateUpdate = time();//запомнили дату обращения за каталогом
            if (!isset($this->formats[$link->format])) {
                ddd('There is not format for '.$link->format);
            }
            $this->format = $this->formats[$link->format];
            $csv = $service->getCatalog($link->csv, $this->refresh_csv);
            echo "Catalog " . $link->id . ":" . $link->name . " from CpaLink " . $link->cpa_link_id . "\n";
            $link->product_count = $this->writeCatalog($csv, $link);
            if (!$this->error) {
                $link->date_import = date('Y-m-d H:i:s', $dateUpdate);
            }
            $link->save();
            if ($this->refresh_csv) {
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

                $photoPath = $catalog->cpaLink->affiliate_id . '/' . $catalog->id . '/';
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
                    $prod = array_combine($headers, $row);

                    $count++;
                    $product = $this->makeProduct($prod);
                    $lang = Yii::$app->languageDetector->detect($product['name'].$product['description']);
                    if (!in_array($lang, ['en', 'ru', 'de', 'da', 'fr', 'it', 'es', 'pl', 'no', 'ro', 'pt', 'sv'])) {
                        //Пропускать только раздрешенные языки
                        continue;
                    }

                    $product['available'] = 2;//(string)$prod['Stock Availability'] = 'Y' ? 1 : 0; //??
                    $product['cpa_id'] = $this->cpaId;
                    $product['catalog_id'] = $catalog->id;
                    $product['store_id'] = $store_id;
                    $product['photo_path'] = $photoPath;
                    $product['check_unique'] = $catalogCount > 0;//если товаров нет из этого каталога, то не нужно проверять уникальность
                    $product['modified_time'] = strtotime($catalog->date_download);
                    $product['categoryId'] = isset($product['categories_string']) ?
                        implode('/', preg_split('/\s*>\s*/', (string) $product['categories_string'])) : '';

                    $result = null;

                    //ddd($prod, $product);

                    $result = Product::addOrUpdate($product, $store);

                    if ($result['error']) {
                        d($result['product']->errors);
                    }
                    $insert += $result['insert'];
                    $error += $result['error'];
                    if ($count % 100 == 0) {
                        if ($start_mem < memory_get_peak_usage()) {
                            gc_collect_cycles();
                            $start_mem = memory_get_peak_usage();
                            echo "    memory usage " . number_format(memory_get_peak_usage()) . "\n";
                        }
                        echo date('Y-m-d H:i:s', time()) . ' ' . $count . "\n";
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
            $this->error  = true;
            d('Ошибка при загрузке файла ' . $txt . ' ' . $e->getMessage());
            d($e->getFile(), $e->getLine());
        }
        return $count;
    }

    protected function makeProduct($product)
    {
        $out = [];
        foreach ($this->format['fields'] as $param => $value) {
            $out[$param] = null;
            foreach ($value['out'] as $item) {
                if (!empty($product[$item])) {
                    if (!empty($value['float'])) {
                        $out[$param] = (float)($product[$item]);
                    } elseif (!empty($value['chars'])) {
                        $out[$param] = preg_replace('/[^a-zA-Z]/', '', (string)$product[$item]);
                    } else {
                        $out[$param] = (string)($product[$item]);
                    }
                    continue;
                }
            }
        }
        $params = [];
        $params_original = [];
        foreach ($this->format['params'] as $paramName) {
            if (!empty($product[$paramName])) {
                $value = (string) $product[$paramName];
                $value = strtolower($value)=='false' ? 0 : $value;
                $value = strtolower($value) =='true' ? 1 : $value;
                $params[$paramName] = [$value];
                $params_original[] = $paramName.':'. $value;
            }
        }
        $out['params'] = $params;
        $out['params_original'] = empty($params_original) ? null : implode('|', $params_original);
        return $out;
    }


}