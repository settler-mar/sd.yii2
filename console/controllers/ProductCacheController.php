<?php

namespace console\controllers;

use yii\console\Controller;
use yii\helpers\Console;
use Yii;
use frontend\modules\product\models\ProductsCategory;
use frontend\modules\product\models\Product;
use frontend\modules\product\models\ProductsToCategory;
use frontend\modules\product\models\CatalogStores;


class ProductCacheController extends Controller
{
    protected $cache;
    protected $cacheDuration = 2592000;//1 месяц

    protected $cacheNames = [
        'products_category' => 'Категории по ID',
        'products_category_route' => 'Категории по route',
    ];

    protected $areasWhere;
    protected $treeByRoute;


    public function beforeAction($action)
    {
        if (Console::isRunningOnWindows()) {
            shell_exec('chcp 65001');
        }
        $this->cache = Yii::$app->cache_shop;
        return parent::beforeAction($action);
    }

     /**
     * Кэш - категории продуктов
     */
    public function actionCategory()
    {
        $cacheProducts = 'products_category';
        if (!in_array($cacheProducts, array_keys($this->cacheNames))) {
            ddd('Имя кэш неверно');
        }
        $regions = $this->getRegions();
        foreach ($regions as $regionKey => $region) {
            $cacheName = $cacheProducts . '_region_'.$regionKey;

            $this->areasWhere = $this->makeAreasWhere($region['areas']);

            try {
                $categories = ProductsCategory::tree([
                    'flat' => true,
                    'is_admin'=>true,
                    'key'=>'id',
                    'areas' => $region['areas']
                ]);
                $resultCategories = [];
                foreach ($categories as $categoryId => $category) {
                    $newCategory = [
                        'id' => $category['id'],
                        'name' => $category['name'],
                        'parent' => $category['parent'],
                        'store_id' => $category['store_id'],
                        'active' => $category['active'],
                        'children' => isset($category['direct_children_id']) ? $category['direct_children_id'] : null,

                    ];
                    if ($category['active'] == ProductsCategory::PRODUCT_CATEGORY_ACTIVE_YES) {
                        $newCategory['route'] = $category['route'];
                        $newCategory['names'] = $category['names'];
                        $newCategory['full_route'] = $category['full_route'];
                        $newCategory['count'] = $category['count_all'];
                        $newCategory['children_ids'] = isset($category['children_id']) ? $category['children_id'] : null;
                        $categoryProps = $this->categoryProperties(array_merge(
                            [$category['id']],
                            isset($category['children_id']) ? $category['children_id'] : []
                        ));
                        $newCategory['price_min'] = $categoryProps['prices']['min'];
                        $newCategory['price_max'] = $categoryProps['prices']['max'];
                        $newCategory['vendor_list'] = $categoryProps['vendors'];
                        $newCategory['stores_list'] = $categoryProps['stores'];
                    }
                    $resultCategories[$categoryId] = $newCategory;
                }
                $this->cache->set($cacheName, $resultCategories, $this->cacheDuration);
                echo $this->cacheNames[$cacheProducts] . ' Регион ' . $region['name'] . ' - ok'."\n";
            } catch (\Exception $e) {
                d($e->getMessage(). ' in '.$e->getFile().' on line '.$e->getLine());
            }

        }
    }

    /**
     * Кэш - категории продуктов по route
     */
    public function actionCategoryRoutes()
    {
        $cacheProducts = 'products_category_route';
        if (!in_array($cacheProducts, array_keys($this->cacheNames))) {
            ddd('Имя кэш неверно');
        }
        $regions = $this->getRegions();
        foreach ($regions as $regionKey => $region) {
            $cacheName = $cacheProducts . '_region_'.$regionKey;

            $this->areasWhere = $this->makeAreasWhere($region['areas']);

            try {
                $categories = ProductsCategory::tree([
                    'is_admin'=>true,
                    'areas' => $region['areas']
                ]);
                $this->treeByRoute = [];
                $this->makeTreeByRoute($categories);

                $this->cache->set($cacheName, $this->treeByRoute, $this->cacheDuration);
                echo $this->cacheNames[$cacheProducts] . ' Регион ' . $region['name'] . ' - ok'."\n";
            } catch (\Exception $e) {
                d($e->getMessage(). ' in '.$e->getFile().' on line '.$e->getLine());
            }
        }
    }

    /**
     * в $this->treeByRoute пишем линейный массив, елементы которого - все узлы дерева категорий со своими дочерними
     * ключ - полный роут
     * @param $categories
     * @return array
     */
    protected function makeTreeByRoute($categories)
    {
        $newCategories = [];
        foreach ($categories as $category) {
            if ($category['active'] != ProductsCategory::PRODUCT_CATEGORY_ACTIVE_YES) {
                continue;
            }
            $newCategory = [
                'id' => $category['id'],
                'children' => !empty($category['children']) ? $this->makeTreeByRoute($category['children']) : null,
            ];
            $this->treeByRoute[$category['full_route']] = $newCategory;
            $newCategories[$category['full_route']] = $newCategory;
        }
        return $newCategories;
    }


    /**
     * отдельный метод - на случай если нужно будет что-то изменить
     * @return mixed
     */
    protected function getRegions()
    {
        return Yii::$app->params['regions_list'];
    }

    /**
     * для каждой активной категории
     * @param $categories
     * @return array
     */
    protected function categoryProperties($categories)
    {
        $queryStore = Product::find()
            ->from(Product::tableName().' p')
            ->leftJoin(ProductsToCategory::tableName().' pc', 'p.id = pc.product_id')
            ->where(['pc.category_id' => $categories])
            ->asArray();

        if (!empty($this->areasWhere)) {
            $queryStore->leftJoin(CatalogStores::tableName() . ' cs', 'cs.id = p.catalog_id')
                ->andWhere($this->areasWhere);
        }
        $queryCount = clone $queryStore;
        $queryVendor = clone $queryStore;
        $queryCount = $queryCount->select(['max(price) as max', 'min(price) as min'])->all();
        $queryStore = $queryStore->select(['store_id'])->groupBy('store_id')->all();
        $queryVendor = $queryVendor->select(['vendor_id'])->groupBy('vendor_id')->all();
        return [
            'prices' => $queryCount[0],
            'stores' => array_column($queryStore, 'store_id'),
            'vendors' => array_column($queryVendor, 'vendor_id'),
        ];
    }

    /**
     * условие запроса по регионам
     * @param $areas
     * @return array|bool
     */
    protected function makeAreasWhere($areas)
    {
        if (empty($areas)) {
            return false;
        }
        $areasWhere = [];
        foreach ($areas as $area) {
            $areasWhere[] = 'JSON_CONTAINS(cs.regions,\'"' . $area . '"\',"$")';
        }
        return array_merge([
            'or',
            ['=', 'JSON_LENGTH(`cs`.`regions`)', 0],
            ['is', '`regions`', null],
        ], $areasWhere);
    }

}