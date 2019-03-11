<?php

namespace console\controllers;

use frontend\modules\product\models\CatalogStores;
use frontend\modules\product\models\Product;
use frontend\modules\product\models\ProductsCategory;
use frontend\modules\product\models\ProductsToCategory;
use frontend\modules\stores\models\Stores;
use Yii;
use yii\console\Controller;
use yii\helpers\Console;


class ProductCacheController extends Controller
{
  protected $cache;

  protected $cacheNames = [
      'products_category' => 'Категории по ID',
      'products_category_route' => 'Категории по route',
      'products_vendors' => 'Список вендоров',
      'products_stores' => 'Список шопов',
  ];

  protected $cacheDuration = 2592000;//1 месяц

    protected $areasWhere;
    protected $treeByRoute;
    protected $categoryList;


  public function beforeAction($action)
  {
    if (Console::isRunningOnWindows()) {
      shell_exec('chcp 65001');
    }
    $this->cache = Yii::$app->cache_shop;
    return parent::beforeAction($action);
  }

  /**
   * Кеш - все
   */
  public function actionIndex()
  {
    echo $this->timeStamp()."Создание кеш товаров\n";
    $this->actionCategory();
    $this->actionCategoryRoutes();
    $this->actionStore();
    $this->actionVendor();
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
      $cacheName = $cacheProducts . (!empty($regionKey)?'_region_' . $regionKey:'');
      $this->areasWhere = empty($region['areas']) ? false : $this->makeAreasWhere($region['areas']);
      try {
        if(true) {
          $categories=[];
          ProductsCategory::flat([
              'areas' => empty($region['areas']) ? [] : $region['areas'],
              'language' => 'ru'
          ],$categories);
        }else {
          $categories = ProductsCategory::tree([
              'flat' => true,
              'is_admin' => true,
              'key' => 'id',
              'areas' => empty($region['areas']) ? [] : $region['areas'],
              'language' => empty($region['langDefault']) ? 'ru' : $region['langDefault']
          ]);
        }

        $resultCategories = [];
        foreach ($categories as $categoryId => $category) {
          $newCategory = [
              'id' => $category['id'],
              'name' => $category['name'],
              'parent' => $category['parent'],
              'store_id' => $category['store_id'],
              'active' => $category['active'],
              'children' => isset($category['children']) ? $category['children'] : null,
          ];
          if ($category['active'] == ProductsCategory::PRODUCT_CATEGORY_ACTIVE_YES) {
            $newCategory['route'] = $category['route'];
            $newCategory['names'] = $category['names'];
            $newCategory['full_route'] = $category['full_route'];
            $newCategory['count'] = $category['count_all'];
            $newCategory['children_ids'] = isset($category['children_ids']) ? $category['children_ids'] : null;

            $doc_ids=!empty($category['children_ids']) ? $category['children_ids'] : [];
            $doc_ids[]=$category['id'];
            $categoryProps = $this->productsProperties([
                'category' => $doc_ids
            ]);
            $newCategory['price_min'] = $categoryProps['prices']['min'];
            $newCategory['price_max'] = $categoryProps['prices']['max'];
            $newCategory['count'] = $categoryProps['prices']['count'];
            $newCategory['vendor_list'] = $categoryProps['vendors'];
            $newCategory['stores_list'] = $categoryProps['stores'];
          }
          $resultCategories[$categoryId] = $newCategory;
        }
        $this->cache->set($cacheName, $resultCategories, $this->cacheDuration);

        echo $this->timeStamp().$this->cacheNames[$cacheProducts] . ' Регион ' . $region['name'] . ' - ok' . "\n";
      } catch (\Exception $e) {
        d($e->getMessage() . ' in ' . $e->getFile() . ' on line ' . $e->getLine());
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
      $cacheName = $cacheProducts . (!empty($regionKey)?'_region_' . $regionKey:'');

      $this->areasWhere = empty($region['areas']) ? false : $this->makeAreasWhere($region['areas']);

      try {
        $categories = ProductsCategory::tree([
            'is_admin' => true,
            'areas' => empty($region['areas']) ? [] : $region['areas'],
            'language' => empty($region['langDefault']) ? 'ru' : $region['langDefault']
        ]);
        $this->treeByRoute = [];
        $data = $this->makeTreeByRoute($categories);

        $this->cache->set($cacheName, $data, $this->cacheDuration);
        //$this->cache->set($cacheName, $this->treeByRoute, $this->cacheDuration);
        echo $this->timeStamp().$this->cacheNames[$cacheProducts] . ' Регион ' . $region['name'] . ' - ok' . "\n";
      } catch (\Exception $e) {
        d($e->getMessage() . ' in ' . $e->getFile() . ' on line ' . $e->getLine());
      }
    }
  }

  protected function timeStamp(){
    return $this->ansiFormat(date('Y-m-d H:i:s', time()),Console::FG_CYAN).'  ';
  }
  /**
   * Кэш - список шопов
   */
  public function actionStore()
  {
    $cacheStores = 'products_stores';
    if (!in_array($cacheStores, array_keys($this->cacheNames))) {
      ddd('Имя кэш неверно');
    }
    $regions = $this->getRegions();
    foreach ($regions as $regionKey => $region) {
      $cacheName = $cacheStores . (!empty($regionKey)?'_region_' . $regionKey:'');

      $this->areasWhere = empty($region['areas']) ? false : $this->makeAreasWhere($region['areas']);

      try {
        $storesResult = [];
        $query = Product::find()
            ->from(Product::tableName() . ' p')
            ->select(['store_id'])
            ->groupBy('store_id')
            ->asArray();
        if (!empty($this->areasWhere)) {
          $query->leftJoin(CatalogStores::tableName() . ' cs', 'cs.id = p.catalog_id')
              ->andWhere($this->areasWhere);
        }
        $stores = $query->all();
        foreach ($stores as $store) {
          $properties = $this->productsProperties(['store_id' => $store['store_id']]);
          $storesResult[$store['store_id']] = [
              'price_min' => $properties['prices']['min'],
              'price_max' => $properties['prices']['max'],
              //'count' => $properties['prices']['count'],
              'vendor_list' => $properties['vendors']
          ];
        }
        $this->cache->set($cacheName, $storesResult, $this->cacheDuration);
        echo $this->timeStamp().$this->cacheNames[$cacheStores] .' Регион ' . $region['name'] . ' - ok' . "\n";
      } catch (\Exception $e) {
        d($e->getMessage() . ' in ' . $e->getFile() . ' on line ' . $e->getLine());
      }
    }
  }

  /**
   * Кэш - список вендоров
   */
  public function actionVendor()
  {
    $cacheStores = 'products_vendors';
    if (!in_array($cacheStores, array_keys($this->cacheNames))) {
      ddd('Имя кэш неверно');
    }
    $regions = $this->getRegions();
    foreach ($regions as $regionKey => $region) {
      $cacheName = $cacheStores . (empty($regionKey)?'_region_' . $regionKey:'');

      $this->areasWhere = empty($region['areas']) ? false : $this->makeAreasWhere($region['areas']);

      try {
        $vendorsResult = [];
        $query = Product::find()
            ->from(Product::tableName() . ' p')
            ->select(['vendor_id'])
            ->groupBy('vendor_id')
            ->asArray();
        if (!empty($this->areasWhere)) {
          $query->leftJoin(CatalogStores::tableName() . ' cs', 'cs.id = p.catalog_id')
              ->andWhere($this->areasWhere);
        }
        $vendors = $query->all();
        foreach ($vendors as $vendor) {
          $properties = $this->productsProperties(['vendor_id' => $vendor['vendor_id']]);
          $vendorsResult[$vendor['vendor_id']] = [
              'price_min' => $properties['prices']['min'],
              'price_max' => $properties['prices']['max'],
              'count' => $properties['prices']['count'],
              'stores_list' => $properties['stores'],
          ];
        }
        $this->cache->set($cacheName, $vendorsResult, $this->cacheDuration);
        echo $this->timeStamp().$this->cacheNames[$cacheStores] . ' Регион ' . $region['name'] . ' - ok' . "\n";
      } catch (\Exception $e) {
        d($e->getMessage() . ' in ' . $e->getFile() . ' on line ' . $e->getLine());
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
      $newCategories[$category['route']] = $newCategory;
    }
    return $newCategories;
  }


  /**
   * отдельный метод - на случай если нужно будет что-то изменить
   * @return mixed
   */
  protected function getRegions()
  {
    $region = Yii::$app->params['regions_list'];
    $region += [
        '' => [
            'name' => 'Все',
        ]
    ];
    return $region;
  }

  /**
   * @param $categories
   * @return array
   */
  protected function productsProperties($params = [])
  {
    $query = Product::find()
        ->from(Product::tableName() . ' p')
        ->asArray();

    if (!empty($params['category'])) {
      $query->leftJoin(ProductsToCategory::tableName() . ' pc', 'p.id = pc.product_id')
          ->andWhere(['pc.category_id' => $params['category']]);
    }
    if (!empty($params['store_id'])) {
      $query->andWhere(['p.store_id' => $params['store_id']]);
    }
    if (!empty($params['vendor_id'])) {
      $query->andWhere(['p.vendor_id' => $params['vendor_id']]);
    }
    if (!empty($this->areasWhere)) {
      $query->leftJoin(CatalogStores::tableName() . ' cs', 'cs.id = p.catalog_id')
          ->andWhere($this->areasWhere);
    }
    $queryCount = clone $query;
    $queryVendor = clone $query;
    $resultCount = $queryCount->select(['max(price) as max', 'min(price) as min','count(p.id) as count'])->all();
    $resultStore = $query->select(['store_id'])->groupBy('store_id')->all();
    $resultVendor = $queryVendor->select(['vendor_id'])->groupBy('vendor_id')->all();
    return [
        'prices' => $resultCount[0],
        'stores' => array_column($resultStore, 'store_id'),
        'vendors' => array_diff(array_column($resultVendor, 'vendor_id'), [null]),
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

    /** дерево категорий (или список при $params['flat'] => true)
     * @param null $params
     * @return array
     */
    protected function categoryTree($params = null)
    {
        $categories = $this->getChildrens($params, null, '');
        if (empty($categories)) {
            return [];
        }
        $children = [];
        foreach ($categories as $category) {
            $active = $category['active'] == ProductsCategory::PRODUCT_CATEGORY_ACTIVE_YES;
            if ($active) {
                $children[$category['id']] = $category;
            }
        }
        if (!empty($children)) {
            if (!empty($params['flat'])) {
                return Yii::$app->help->arrayToFlat($children, 'children');
            }
            return $children;
        }
    }

    /**
     * @param null $params
     * @param null $parent
     * @param string $startRoute
     * @param array $names
     * @return array|mixed
     */
    protected function getChildrens($params = null, $parent = null, $startRoute = '', $names = [])
    {
        $categoryArrays = $this->productsCategoryList();
        $parent =  (empty($parent)) ? 0 : $parent;
        $categoryArr = isset($categoryArrays[$parent]) ? $categoryArrays[$parent] : [];

        foreach ($categoryArr as &$item) {
            $item['full_route'] = trim($startRoute . '/' . $item['route'], '/');
            $item['names'] = array_merge($names, [$item['name']]);//Названия путей
            $childs = self::getChildrens($params, $item['id'], $item['full_route'], $item['names']);
            if (!empty($childs)) {
                $children = [];
                $item['children_id'] = []; //все дочерние
                $item['direct_children_id'] = []; //прямые дочерние
                foreach ($childs as $child) {
                    $item['count_all'] += $child['count_all'];
                    $children[$child['id']] = $child;
                    $item['children_id'][] = $child['id'];
                    $item['direct_children_id'][] = $child['id'];
                    if (!empty($child['children_id'])) {
                        $item['children_id'] = //дополнили дочерние
                            yii\helpers\ArrayHelper::merge($child['children_id'], $item['children_id']);
                    }
                }
                if (!empty($children)) {
                    $item['children'] = $children;
                }
            };
        }
        return $categoryArr;
    }

    /**
     * список родительских категорий
     * @return array
     */
    protected function productsCategoryList()
    {
        if (empty($this->categoryList)) {
            $language = '';

            $categoryArr = ProductsCategory::translated($language, ['id', 'name', 'active', 'route', 'store_id'])
                ->orderBy(['menu_index' => SORT_ASC, 'name' => SORT_ASC])
                ->andWhere(['synonym' => null])
                ->andWhere([
                    'or',
                    ['s.is_active' => [0, 1]],//шоп активен
                    ['s.is_active' => null]
                ])
                ->leftJoin(ProductsToCategory::tableName() . ' ptc', 'pc.id = ptc.category_id')
                ->leftJoin(Product::tableName() . ' p', 'p.id = ptc.product_id')
                ->leftJoin(Stores::tableName() . ' s', 's.uid = p.store_id')
                ->groupBy(['pc.id', 'pc.name', 'pc.parent', 'pc.active', 'route', 'parent'])
                ->addSelect(['count(ptc.id) as count_all', 'parent']);

            if (!empty($this->areasWhere)) {
                $categoryArr->leftJoin(CatalogStores::tableName() . ' cs', 'cs.id = p.catalog_id');
                $categoryArr->andWhere($this->areasWhere);
            }

            $categoryArr = $categoryArr->asArray()->all();

            $out = [];
            foreach ($categoryArr as $category) {
                $parentId = !empty($category['parent']) ? $category['parent'] : 0;
                if (!isset($out[$parentId])) {
                    $out[$parentId] = [];
                }
                $out[$parentId][] = $category;
            }
            //массив всех родительских категорий, внутри - его дочерние
            $this->categoryList = $out;
        }
        return $this->categoryList;
    }

}