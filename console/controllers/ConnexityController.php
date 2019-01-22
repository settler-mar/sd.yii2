<?php

namespace console\controllers;

use common\models\Connexity;
use frontend\modules\stores\models\Cpa;
use frontend\modules\stores\models\CpaLink;
use frontend\modules\stores\models\Stores;
use frontend\modules\product\models\Product;
use frontend\modules\product\models\CatalogStores;
use yii;
use yii\console\Controller;
use frontend\modules\cache\models\Cache;

class ConnexityController extends Controller
{
    protected $service;
    protected $cpa_id;

    protected $count;
    protected $inserted;
    protected $error;

    protected $categoryTree = null;
    protected $categoryes=[];
    protected $feedList = false;
    protected $brands = false;
    protected $config;

    public function init()
    {
        if (isset(Yii::$app->params['connexity'])) {
            $this->config = Yii::$app->params['connexity'];
        } else {
            ddd('Error - Config for Connexity not found!');
        }
        $this->service = new Connexity();
        $cpa = Cpa::findOne(['name' => 'Connexity']);
        if (!$cpa) {
            ddd('Error - Cpa Connexity not found!');
        }
        $this->cpa_id = $cpa->id;
    }

    //вариант с api
    public function actionStoreTest()
    {
        $response = $this->service->merchantInfo(['activeOnly'=>'true']);
        $stores = isset($response['merchant']) ? $response['merchant'] : [];
        foreach ($stores as $store) {
            d($store);
        }
    }

    //вариант с загрузкой
    public function actionStore()
    {
        $count = 0;
        $inserted = 0;
        $errors = 0;
        $insertedCpaLink =0 ;
        $affiliate_list = [];
        $errorsCpaLink = 0;
        $dateUpdates = $this->service->dateUpdate();
        $dateUpdate = isset($dateUpdates['build']['timestamp']) ? $dateUpdates['build']['timestamp'] :
            date('Y-m-d H:i:s');

        $response = $this->service->merchantFeed();
        $stores = isset($response['merchant']) ? $response['merchant'] : [];
        foreach ($stores as $merchant) {
            $count++;
            $affiliate_id = $merchant['mid'];
            $info = $merchant['merchantInfo'];
            $affiliate_list[] = $affiliate_id;

            $newStore = [
                'logo' => isset($info['logoUrl']) ? $info['logoUrl'] : null,
                'cpa_id' => $this->cpa_id,
                'affiliate_id' => $affiliate_id,
                'url' => isset($info['merchantUrl']) ? $info['merchantUrl'] : null,
                'name' => isset($info['name']) ? $info['name'] : null,
                'currency' => 'USD',
                'cashback' => "0",
                'hold_time' => 30,
                'affiliate_link' => isset($info['url']) ? $info['url'] : null,
            ];

            $storeResult = Stores::addOrUpdate($newStore);
            if (!$storeResult['result']) {
                $errors++;
            } else {
                $catalog_db = CatalogStores::find()
                    ->where([
                        'cpa_link_id' => $storeResult['cpa_link']->id,
                        'name' => $info['name'],
                    ])
                    ->one();
                if (!$catalog_db) {
                    $catalog_db = new CatalogStores();
                    $catalog_db->cpa_link_id = $storeResult['cpa_link']->id;
                    $catalog_db->name = $info['name'];
                    $catalog_db->active = 2;
                }
                $catalog_db->date_download = $dateUpdate;
                $catalog_db->csv = '';

                $catalog_db->save();
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
        LEFT JOIN cw_cpa_link cpl on cpl.cpa_id=" . $this->cpa_id . " AND cws.`active_cpa`=cpl.id
        SET `is_active` = '0'
        WHERE cpl.affiliate_id NOT in(" . implode(',', $affiliate_list) . ") AND is_active!=-1";
        Yii::$app->db->createCommand($sql)->execute();
        echo 'Stores ' . $count . "\n";
        echo 'Inserted ' . $inserted . "\n";
        if (!empty($errors)) {
            echo 'Stores fails ' . $errors . "\n";
        }
        echo 'Inserted Cpa link ' . $insertedCpaLink . "\n";
        if (!empty($errorsCpaLink)) {
            echo 'Cpa link fails ' . $errorsCpaLink . "\n";
        }
    }

        //через апи по категориям
    public function actionProductTest()
    {
        $taxonomy = $this->service->taxonomy();

        if (isset($taxonomy['taxonomy']['categories']['category'][0]['children']['category'])) {
            //корневые категории
            $categories = $taxonomy['taxonomy']['categories']['category'][0]['children']['category'];

            foreach ($categories as $category) {
                d($category['id'].' '.$category['name'].' '.$category['uniqueName']);
                //без ид категории не возвращает , если точнее..
                // Note that though all three of the categoryId, keyword and productId parameters are listed as optional, at least one of them must be specified.
                $limit = 50;
                $start = 0;
                $all = $limit + 1;
                do {
                    $response = $this->service->products(['categoryId' => $category['id'], 'start'=>$start, 'results'=>$limit]);
                    $products = isset($response['products']['product']) ? $response['products']['product'] : [];
                    foreach ($products as $product) {
                        //$this->writeProduct($product);
                        d($product);
                    }
                    $count = count($products);
                    $start = $start + $count;
                    $all = isset($response['products']['totalResults']) ? $response['products']['totalResults'] : $all;
                    //d($start, $count, $all);
                } while ($start + $count < $all + 1);

                break;
            }
        }
        echo "Insert Connexity products \n";
        echo "Products $this->count\n";
    }

    public function actionProduct()
    {
        Yii::$app->cache->flush();
        Yii::$app->params['cash'] = false;

        $links = CatalogStores::find()
            ->from(CatalogStores::tableName() . ' cat')
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
                ['cpalink.cpa_id' => $this->cpa_id]
            ])->all();

        if (!$links) {
            echo "There ara no catalogs for refresh";
            return;
        }
        Cache::deleteName('catalog_stores_used');
        Cache::deleteName('stores_used_by_catalog');

        foreach ($links as $link) {
            $dateUpdate = time();//запомнили дату обращения за каталогом
            $merchantId = $link->cpaLink->affiliate_id;
            $feedPrefix = $this->service->feedsUrl . $merchantId. '_';
            $feedList = $this->feeds();
            $productCount = 0;
            $insert = 0;
            $error = 0;
            $photoPath = $merchantId . '/' . $link->id . '/';
            $store = $link->cpaLink->store->toArray();
            $store_id = $store['uid'];
            $catalogCount = Product::find()->where(['catalog_id' => $link->id])->count();
            $start_mem = memory_get_peak_usage();

            foreach ($feedList as $feed) {
                if (strpos($feed, $feedPrefix) === 0) {
                    $feed = substr($feed, strlen($this->service->feedsUrl));
                    $response = $this->service->productFeed($feed);
                    $products  = isset($response['offers']['offer']) ? $response['offers']['offer'] : [];


                    foreach ($products as $prod) {
                        $productCount++;

                        $product['categoryId'] =  $this->getCategoryById($prod['categoryId']);
                        $product['available'] = (string)$prod['stock'] = 'IN' ? 1 : 2;
                        //$product['params_original'] = '';
                        $product['cpa_id'] = $this->cpa_id;
                        $product['catalog_id'] = $link->id;
                        $product['store_id'] = $store_id;
                        $product['photo_path'] = $photoPath;
                        $product['check_unique'] = $catalogCount > 0;//если товаров нет из этого каталога, то не нужно проверять уникальность
                        $product['name'] = isset($prod['title']) ? $prod['title'] : '';
                        $product['image'] = isset($prod['images']['image'][0]['value']) ?
                            $prod['images']['image'][0]['value'] : null;
                        $product['id'] = isset($prod['id']) ? $prod['id'] : null;
                        $product['description'] = $prod['description'];
                        $price = isset($prod['price']['value']) ? $prod['price']['value'] : null;
                        $priceOld = isset($prod['originalPrice']['value']) ? $prod['originalPrice']['value'] : null;
                        $product['price'] = $price;
                        $product['oldprice'] = $priceOld;
                        $product['url'] = isset($prod['url']['value']) ? $prod['url']['value'] : null;
                        $vendor = isset($prod['brandId']) ? $this->brandName($prod['brandId']) : null;
                        $product['vendor'] = $vendor ? $vendor : (isset($prod['manufacturer']) ? $prod['manufacturer'] : null);
                        $product['modified_time'] = strtotime($link->date_download);

                        $result = null;
                        $result = Product::addOrUpdate($product, $store);

                        if ($result['error']) {
                            d($result['product']->errors);
                        }
                        $insert += $result['insert'];
                        $error += $result['error'];
                        if ($productCount % 100 == 0) {
                            if ($start_mem < memory_get_peak_usage()) {
                                gc_collect_cycles();
                                $start_mem = memory_get_peak_usage();
                                echo "    memory usage " . number_format(memory_get_peak_usage()) . "\n";
                            }
                            echo date('Y-m-d H:i:s', time()) . ' ' . $productCount . "\n";
                        }



                    }
                }
            }
            echo "Catalog " . $link->id . ":" . $link->name . " from CpaLink " . $link->cpa_link_id . "\n";
            $link->product_count = $productCount;
            if (!$this->error) {
                $link->date_import = date('Y-m-d H:i:s', $dateUpdate);
            }
            $link->save();
            echo date('Y-m-d H:i:s', time()) . ' ' . $productCount . " memory usage " . number_format(memory_get_peak_usage()) . "\n";
            echo 'Products ' . $productCount . "\n";
            echo 'Inserted ' . $insert . "\n";
            if ($error) {
                echo 'Errors ' . $error . "\n";
            }
        }

        Cache::deleteName('product_category_menu');
        Cache::clearName('catalog_product');
        Cache::deleteName('products_active_count');
    }

    /**
     * назавние бренда по id
     * @param $id
     * @return null
     */
    protected function brandName($id)
    {
        if ($this->brands === false) {
            $this->getBrands();
        }
        return isset($this->brands[$id]) ? $this->brands[$id] : null;
    }

    /*
     * бренды
     */
    protected function getBrands()
    {

        $limit = 100;
        $start = 0;
        $all = $limit + 1;
        $this->brands = [];
        do {
            $response = $this->service->brands(['start'=>$start, 'results'=>$limit]);
            $brands = isset($response['brands']['brand']) ? $response['brands']['brand'] : [];
            foreach ($brands as $brand) {
                $this->brands[$brand['id']] = $brand['name'];
            }
            $count = count($brands);
            $start = $start + $count;
            $all = isset($response['brands']['totalResults']) ? $response['brands']['totalResults'] : $all;
        } while ($start + $count < $all + 1);
    }


    /**
     * Категории по id
     * @param $id
     * @return mixed|null
     */
    protected function getCategoryById($id)
    {

        if (!isset($this->categoryes[$id])) {
            if ($this->categoryTree === null) {
                $categories = $this->service->taxonomyFeed();
                $this->categoryTree = isset($categories['taxonomy']['categories']['category'][0]['children']['category']) ?
                    $categories['taxonomy']['categories']['category'][0]['children']['category'] : [];
            }
            if (empty($this->categoryTree)) {
                return null;
            }
            $categoriesTree = $this->getChildsCategoryTree($this->categoryTree, $id);
            $categoriesTree = array_reverse($categoriesTree);
            $category = implode('/', array_column($categoriesTree, 'name'));
            $this->categoryes[$id] = $category;
        }
        return $this->categoryes[$id];
    }

    /**
     * рекурсивно массив родительских по id
     * @param $categoryes
     * @param $id
     * @return array
     */
    protected function getChildsCategoryTree($categoryes, $id)
    {
        foreach ($categoryes as $category) {
            if ($category['id'] == $id) {
                return [$category];
            }
            if (isset($category['children']['category'])) {
                $outCategories = $this->getChildsCategoryTree($category['children']['category'], $id);
                if ($outCategories) {
                    $outCategories[] = $category;
                    return $outCategories;
                }
            }
        }
    }

    /*
     * cписок файлов для загрузки
     */
    protected function feeds()
    {
        if ($this->feedList === false) {
            $this->feedList = explode("\n", $this->service->fileList());
        }
        return $this->feedList;
    }



}
