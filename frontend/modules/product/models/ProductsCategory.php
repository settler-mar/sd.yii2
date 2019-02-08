<?php

namespace frontend\modules\product\models;

use common\components\Help;
use common\components\SdImage;
use frontend\modules\cache\models\Cache;
use frontend\modules\stores\models\Cpa;
use frontend\modules\stores\models\Stores;
use yii;

/**
 * This is the model class for table "cw_products_category".
 *
 * @property integer $id
 * @property string $name
 *
 * @property CwProductsToCategory[] $cwProductsToCategories
 */
class ProductsCategory extends \yii\db\ActiveRecord
{
  const PRODUCT_CATEGORY_ACTIVE_NOT = 0;
  const PRODUCT_CATEGORY_ACTIVE_YES = 1;
  const PRODUCT_CATEGORY_ACTIVE_WAITING = 2;

  public $languagesArray;
  public $imagePath = '/images/product_category/';
  public $logoImage;
  public $products_all;

  protected $activeTree = false;
  protected $childCategoriesId = false;
  protected $parentTree = false;


  /**
   * @inheritdoc
   */
  public static function tableName()
  {
    return 'cw_products_category';
  }

  /**
   * @inheritdoc
   */
  public function rules()
  {
    return [
        [['name', 'route'], 'trim'],
      //[['name'], 'required'],
        [['name', 'route', 'logo'], 'string', 'max' => 255],
        [['parent'], 'exist', 'targetAttribute' => 'id'],
        [['active', 'synonym', 'store_id', 'cpa_id', 'menu_index', 'in_top'], 'integer'],
        ['code', 'unique', 'targetAttribute' => ['code', 'store_id', 'cpa_id']],
        [['route'], 'filter', 'filter' => function ($value) {
          $value = $value === '' ? null : $value;
          return $this->synonym ? null : $value;
        }],
        ['active', 'filter', 'filter' => function ($value) {
          return $this->synonym ? self::PRODUCT_CATEGORY_ACTIVE_NOT : $value;
        }],
    ];
  }

  /**
   * @inheritdoc
   */
  public function attributeLabels()
  {
    return [
        'id' => 'ID',
        'name' => 'Название',
        'parent' => 'Родительская категория',
        'synonym' => 'Является синонимом для',
        'active' => 'Активна',
        'menu_index' => 'Позиция в меню',
        'in_top' => 'Выводить в Toп',
        'logo' => 'Логотип',
    ];
  }

  /**
   * @return \yii\db\ActiveQuery
   */
  public function getProductsToCategories()
  {
    return $this->hasMany(ProductsToCategory::className(), ['category_id' => 'id']);
  }

  public function getParentCategory()
  {
    return $this->hasOne(self::className(), ['id' => 'parent']);
  }

  public function getChildCategories()
  {
    return $this->hasMany(self::className(), ['parent' => 'id']);
  }

  public function getSynonymCategory()
  {
    if ($this->synonym == null) {
      return null;
    }
    return $this->hasOne(self::className(), ['id' => 'synonym']);
  }

  public function getSynonyms()
  {
    return $this->hasMany(self::className(), ['synonym' => 'id']);
  }

  public function getCpa()
  {
    return $this->hasOne(Cpa::className(), ['id' => 'cpa_id']);
  }


  public function beforeValidate()
  {
    if (empty($this->route) && $this->isNewRecord &&
        (!isset(Yii::$app->request->pathInfo) || strpos(Yii::$app->request->pathInfo, 'admin') !== 0)) {
      $this->route = Yii::$app->help->str2url($this->name);
    }
    return parent::beforeValidate();
  }

  public function childCategoriesId()
  {
    if ($this->childCategoriesId === false) {
      if (!$this->activeTree) {
        $this->activeTree = self::tree(['where' => ['active' => [ProductsCategory::PRODUCT_CATEGORY_ACTIVE_YES]]]);
      }
      $this->childCategoriesId = self::getCategoryChilds($this->activeTree, $this->id, 'childs_ids');
      $out = [];
      self::getParentsArr($this->activeTree, $this->id, $out);

    }
    return $this->childCategoriesId;
  }

  /**
   * @param bool $mode
   * @return array|bool|string
   */
  public function parentTree($mode = false)
  {
    if ($this->parentTree === false) {
      if (!$this->activeTree) {
        $this->activeTree = self::tree(['where' => ['active' => [ProductsCategory::PRODUCT_CATEGORY_ACTIVE_YES]]]);
      }
      $parents = [];
      self::getParentsArr($this->activeTree, $this->id, $parents);
      $this->parentTree = array_reverse($parents);
    }
    if (!$mode || !$this->parentTree) {
      return $this->parentTree;
    }
    foreach ($this->parentTree as $category) {
      if (empty($category)) continue;
      switch ($mode) {
        case 0:
          $out[] = $category['name'];
          break;
        case 1:
          $out[] = $category['route'];
          break;
        case 2:
          $out[] = '<a href="/admin-category/product/update/id:' . $category['id'] . '">' .
              '<span class="' . self::activeClass($category['active']) . '">' .
              $category['name'] . '</span></a>';
          break;
      }
    }
    return implode($mode == 1 ? '/' : ' / ', $out);
  }

  public function beforeSave($insert)
  {
    if ((int)$this->synonym > 0) {

      ProductsToCategory::updateAll(['category_id' => $this->synonym], ['category_id' => $this->id]);
      $synonym_route = ProductsCategory::find()
          ->select('route')
          ->where(['parent' => $this->synonym])
          ->asArray()
          ->all();
      foreach ($synonym_route as &$item) {
        $item = '\'' . $item['route'] . '\'';
      }

      if (count($synonym_route) > 0) {
        $synonym_route = implode(',', $synonym_route);
        //ddd($synonym_route);
        $sql = 'UPDATE `cw_products_category` SET `route`=CONCAT(`route`,\'_\',`id`) WHERE 
          `route` IN (' . $synonym_route . ') AND
          `parent` =' . $this->id;
        Yii::$app->db->createCommand($sql)->execute();
      }
      //::updateAll(["route" => "CONCAT(`route`,'_',`id`)"], ['route' => $synonym_route]);
      ProductsCategory::updateAll(['parent' => $this->synonym], ['parent' => $this->id]);
    }
    //скорректировать route чтобы не было дублей
    $count = 1;
    $routeStart = preg_replace('/-\d+$/', '', $this->route);
    do {
      $where = $insert ? ['route' => $this->route] : ['and', ['route' => $this->route], ['<>', 'id', $this->id]];
      $withSameRoute = self::find()->where($where)->count();
      if ($withSameRoute) {
        $count++;
        $this->route = $routeStart . '-' . $count;
      }
    } while ($withSameRoute);
    return parent::beforeSave($insert); // TODO: Change the autogenerated stub
  }

  /**
   * @return yii\db\ActiveQuery
   */
  public function getLanguages()
  {
    return $this->hasMany(LgProductsCategory::className(), ['category_id' => 'id']);
  }

  /**
   * сама категория и все родительские по очереди
   * @param $categories
   * @return array
   */
  public static function parents($categories, $level = 0)
  {
    //ddd(1);

    $cache = Yii::$app->cache;
    $cacheName = 'catalog_category_parents_' . $categories[count($categories) - 1]['id'];
    $cats = $cache->get($cacheName);
    if ($cats == false) {
      if ($categories[count($categories) - 1]['parent'] != null) {
        // нет в кэше, вычисляем заново
        $parent = self::find()->select(['*'])
            ->where(['id' => $categories[count($categories) - 1]['parent']])
            ->asArray()->one();
        if ($parent) {
          $categories[] = $parent;
          $categories = static::parents($categories, $level + 1);
        }
      }
      if ($level == 0) {
        //сохраняемся только в начале дерева, т.е. в самой дочерней категории
        $dependencyName = 'catalog_product';
        $dependency = new yii\caching\DbDependency;
        $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $dependencyName . '"';
        $cache->set($cacheName, $categories, $cache->defaultDuration, $dependency);
      }
    } else {
      //если нашли в кеш - то это более высокая родительская, пристыковать к имещюемуся пути
      $categories = array_merge(array_slice($categories, 0, count($categories) - 1), $cats);
    }
    return $categories;
  }

  public static function getParents($id, $categories_db = false)
  {
    $categories = [];

    if (!$categories_db) {
      $categories_db = Yii::$app->globals->get('product_categories');

      if (empty($categories_db)) {
        $categories_db = ProductsCategory::find()
            ->from(ProductsCategory::tableName() . ' pc')
            //->leftJoin(ProductsToCategory::tableName(). ' ptc', 'pc.id = ptc.category_id')
            ->select(['pc.id', 'pc.name', 'pc.parent', 'pc.active', 'pc.route'])
            ->groupBy(['pc.id', 'pc.name', 'pc.parent', 'pc.active', 'pc.route'])
            ->orderBy(['pc.name' => SORT_ASC])
            ->asArray()
            ->all();
        $categories_db = yii\helpers\ArrayHelper::index($categories_db, 'id');
        Yii::$app->globals->set('product_categories', $categories_db);
      }
    } else {
      Yii::$app->globals->set('product_categories', $categories_db);
    }

    $i = 0;
    while (!empty($id)) {
      $item = $categories_db[$id];
      $categories[] = $item;
      $i++;
      if ($i > 8) break;
      $id = empty($item['parent']) ? null : $item['parent'];
    }

    return $categories;
  }

  /**
   * @param $category
   * @param int $mode 0 - names, 1 - roures, 2 - links to edit
   * @return string
   */
  public static function parentsTree($category, $mode = 0, $categories = false, $max_lavel = false)
  {
    $out = [];
    //$categories = static::parents([$category],0,$categories);
    if (is_object($category)) {
      $category = $category->id;
    } elseif (is_array($category)) {
      $category = $category['id'];
    }

    $categories = static::getParents($category, $categories);

    for ($i = count($categories) - 1; $i >= 0; $i--) {
      if (empty($categories[$i])) continue;
      //ddd($categories[$i]);
      switch ($mode) {
        case 0:
          $out[] = $categories[$i]['name'];
          break;
        case 1:
          $out[] = $categories[$i]['route'];
          break;
        case 2:
          $out[] = '<a href="/admin-category/product/update/id:' . $categories[$i]['id'] . '">' .
              '<span class="' . self::activeClass($categories[$i]['active']) . '">' .
              $categories[$i]['name'] . '</span></a>';
          break;
      }
    }
    return implode($mode == 1 ? '/' : ' / ', $out);
  }

  /**
   * дерево категорий
   * @param array $params
   * @return mixed
   */

  public static function tree($params = [])
  {
    $language = Yii::$app->language == Yii::$app->params['base_lang'] ? false : Yii::$app->language;
    $areas = Yii::$app->params['location']['areas'];

    $cacheName =
        'catalog_categories_menu_' .
        Yii::$app->params['url_prefix'] . ':' .
        implode('_', $areas);

    $areas_where = [];
    if (!empty($areas)) {
      foreach ($areas as $area) {
        $areas_where[] = 'JSON_CONTAINS(cs.regions,\'"' . $area . '"\',"$")';
      }
    }

    $cache = \Yii::$app->cache;
    $dependency = new yii\caching\DbDependency;
    $dependencyName = 'catalog_product';
    $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $dependencyName . '"';

    $out = $cache->getOrSet(
        $cacheName,
        function () use ($params, $language, $dependency, $areas_where) {
          $t = self::getChildrens(null, $language, $areas_where);
          if (empty($t)) return [];

          $children = [];
          foreach ($t as $el) {
            if ($el['count'] > 0 && $el['active']) {
              $children[] = $el;
            }
          }
          if (!empty($children)) {
            return $children;
          }
          return [];
        },
        $cache->defaultDuration,
        $dependency
    );
    ddd($out);
  }

  private static function getChildrens($parent, $language, $areas_where, $max_level = 20)
  {
    if ($max_level == 0) return false;

    $categoryArr = self::translated($language, ['id', 'name', 'active', 'route'])
        ->orderBy(['menu_index' => SORT_ASC, 'name' => SORT_ASC]);

    if (empty($parent)) {
      $categoryArr->andWhere(['or',
          ['parent' => 0],
          ['parent' => null]
      ]);
    } else {
      $categoryArr->andWhere(['parent' => $parent]);
    }
    $categoryArr->leftJoin(ProductsToCategory::tableName() . ' ptc', 'pc.id = ptc.category_id')
        ->leftJoin(Product::tableName() . ' p', 'p.id = ptc.product_id')
        ->leftJoin(Stores::tableName() . ' s', 's.uid = p.store_id')
        ->groupBy(['id', 'name', 'parent', 'pc.active', 'route'])
        ->addSelect(['count(ptc.id) as count']);

    if (!empty($areas_where)) {
      $categoryArr->leftJoin(CatalogStores::tableName() . ' cs', 'cs.id = p.catalog_id');
      $categoryArr->andWhere(array_merge(['or', ['is', 'cs.regions', null]], $areas_where));
    }

    $categoryArr =
        $categoryArr->asArray()
            ->all();

    foreach ($categoryArr as &$item) {
      $t = self::getChildrens($item['id'], $language, $areas_where, $max_level - 1);
      if (!empty($t)) {
        $children = [];
        foreach ($t as $el) {
          $item['count'] += $el['count'];
          if ($el['count'] > 0 && $el['active']) {
            $children[] = $el;
          }
        }
        if (!empty($children)) {
          $item['children'] = $children;
        }
      };
    }
    return $categoryArr;
  }

  public static function treeOld($params = [])
  {
    $language = Yii::$app->language == Yii::$app->params['base_lang'] ? false : Yii::$app->language;
    $cacheName = 'catalog_categories_menu' . (!empty($params) ? Help::multiImplode('_', $params) : '') .
        Yii::$app->params['url_prefix'];// ;
    $cache = \Yii::$app->cache;
    $dependency = new yii\caching\DbDependency;
    $dependencyName = 'catalog_product';
    $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $dependencyName . '"';
    $out = $cache->getOrSet(
        $cacheName,
        function () use ($params, $language, $dependency) {
          //d($params);

          $params_t = $params;
          foreach ($params as $k => $v) {
            if (!in_array($k, ['where', 'counts'])) {
              unset($params_t[$k]);
            }
          }
          $cacheName = 'catalog_categories_menu' . (!empty($params_t) ? Help::multiImplode('_', $params_t) : '') .
              Yii::$app->params['url_prefix'];

          $cache = \Yii::$app->cache;
          $categoryArr = $cache->getOrSet(
              $cacheName,
              function () use ($params, $language) {
                $categoryArr = self::translated($language, ['id', 'name', 'parent', 'active', 'route'])
                    ->orderBy(['menu_index' => SORT_ASC, 'name' => SORT_ASC])
                    ->asArray();
                if (isset($params['where'])) {
                  $categoryArr->where($params['where']);
                };
                if (isset($params['counts'])) {
                  //дополнить регионами товаров
                  $regionAreas = isset(Yii::$app->params['regions_list'][Yii::$app->params['region']]['areas']) ?
                      Yii::$app->params['regions_list'][Yii::$app->params['region']]['areas'] : false;

                  $categoryArr->leftJoin(ProductsToCategory::tableName() . ' ptc', 'pc.id = ptc.category_id')
                      ->groupBy(['id', 'name', 'parent', 'pc.active', 'route'])
                      ->addSelect(['count(ptc.id) as count'])
                      ->leftJoin(Product::tableName() . ' p', 'p.id = ptc.product_id')
                      ->leftJoin(Stores::tableName() . ' s', 's.uid = p.store_id');
                  if (!empty($regionAreas) && !empty($params['regions'])) {
                    $categoryArr->leftJoin(CatalogStores::tableName() . ' cs', 'cs.id = p.catalog_id');
                    $where = [];
                    foreach ($regionAreas as $area) {
                      $where[] = 'JSON_CONTAINS(cs.regions,\'"' . $area . '"\',"$")';
                    }
                    $categoryArr->andWhere(array_merge(['or', ['is', 'cs.regions', null]], $where));
                  }
                }
                $categoryArr = $categoryArr->all();
                return $categoryArr;
              },
              $cache->defaultDuration,
              $dependency
          );

          $flat = [];//плоский вариант
          $categories = static::childsCategories($categoryArr, false, $params, $flat);

          return (empty($params['flat'])) ? $categories : $flat;
        },
        $cache->defaultDuration,
        $dependency
    );
    return $out;
  }

  protected static function childsCategories($arr, $parent, $params = [], &$flat)
  {
    $current = isset($params['current']) ? $params['current'] : false;
    $removeEmpty = isset($params['empty']) && $params['empty'] === false;
    $out = [];
    foreach ($arr as $cat) {
      if ($cat['parent'] == ($parent ? $parent['id'] : null)) {
        $cat['full_route'] = $parent ? $parent['full_route'] . '/' . $cat['route'] : $cat['route'];
        $cat['current'] = $cat['id'] == $current;
        $cat['childs'] = static::childsCategories($arr, $cat, $params, $flat);
        $cat['childs_ids'] = [$cat['id']];//в дочерние ид впишем свой ид
        $cat['count_all'] = isset($cat['count']) ? $cat['count'] : 0;//количество всего

        if ($cat['childs']) {
          foreach ($cat['childs'] as $child) {
            if (!empty($child['childs_ids'])) {
              $cat['childs_ids'] = array_merge($cat['childs_ids'], $child['childs_ids']);
            }
            if ($child['current']) {
              //если дочерняя текущая, то сама тоже текущая
              $cat['current'] = true;
            }
            $cat['count_all'] = $cat['count_all'] + $child['count_all'];//сумма количества товаров
          }
        }
        if (!$removeEmpty || $cat['count_all']) {
          //если задано, то с пустым количеством товаров не выводим
          $out[] = $cat;
        }
        if (!empty($params['flat'])) {
          $flat[$cat['id']] = $cat;
        }
      }
    }
    return empty($out) ? null : $out;
  }

  /**
   * @param $id
   * @return array сама категория и все дочерние категории
   */
  public static function childsId($id, $activeOnly = true)
  {
    $out = [$id];
    $where = ['parent' => $id];
    if ($activeOnly) {
      $where = [
          'parent' => $id,
          'active' => [self::PRODUCT_CATEGORY_ACTIVE_YES, self::PRODUCT_CATEGORY_ACTIVE_WAITING]
      ];
    }
    $categories = self::find()->select(['id'])->where($where)->asArray()->all();
    foreach ($categories as $category) {
      $out = array_merge($out, self::childsId($category['id']));
    }
    return $out;
  }


  public function afterSave($insert, $changedAttributes)
  {
    if ($this->synonym) {
      //если выставлен синоним, то убираем перeводы
      LgProductsCategory::deleteAll(['category_id' => $this->id]);
      //перенос категорий товаров в категорию - синоним
      //ProductsToCategory::updateAll(['category_id' => $this->synonym], ['category_id' => $this->id]);
    }
    $this->clearCache();
    parent::afterSave($insert, $changedAttributes);

    $this->saveImage();
  }

  /**
   * @param $route - Array
   * @return mixed
   */
  public static function byRoute($route)
  {
    $cache = \Yii::$app->cache;
    $dependency = new yii\caching\DbDependency;
    $dependencyName = 'catalog_product';
    $language = Yii::$app->language == Yii::$app->params['base_lang'] ? false : Yii::$app->language;
    $casheName = 'products_category_byroute_' . implode('_', $route) . Yii::$app->params['url_prefix'];
    $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $dependencyName . '"';

    $category = $cache->getOrSet($casheName, function () use ($route, $language) {
      $parent = null;
      foreach ($route as $routePart) {
        $category = self::translated($language)->where(['route' => $routePart, 'parent' => $parent])->one();
        if (!$category) {
          return false;
        }
        $parent = $category->id;
      }
      return $category;
    }, $cache->defaultDuration, $dependency);
    return $category;
  }

  /**
   * @param $id - inteder
   * @return mixed
   */
  public static function byId($id)
  {
    $cache = \Yii::$app->cache;
    $dependency = new yii\caching\DbDependency;
    $dependencyName = 'catalog_product';
    $language = Yii::$app->params['url_prefix'];// Yii::$app->language == Yii::$app->params['base_lang'] ? false : Yii::$app->language;
    $casheName = 'products_category_byid_' . $id . ($language ? '_' . $language : '');
    $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $dependencyName . '"';

    $category = $cache->getOrSet($casheName, function () use ($id) {
      return $category = self::findOne($id);
    }, $cache->defaultDuration, $dependency);
    return $category;
  }

  protected function clearCache()
  {
    if (isset(Yii::$app->params['cash']) && Yii::$app->params['cash'] == false) return;
    Cache::deleteName('product_category_menu');
    Cache::clearName('catalog_product');
    Cache::clearName('catalog_product_by_visit');
  }

  public static function activeClass($active)
  {
    switch ($active) {
      case (self::PRODUCT_CATEGORY_ACTIVE_NOT):
        return 'status_1';
      case (self::PRODUCT_CATEGORY_ACTIVE_YES):
        return 'status_2';
      default:
        return 'status_0';
    }
  }

  public static function categoriesJson($except = null)
  {
    $category = self::find()
        ->select(['id', "CONCAT(name,' (',id,')') as name", 'parent'])
        ->orderBy(['name' => SORT_ASC])
        ->where(['synonym' => null, 'active' => self::PRODUCT_CATEGORY_ACTIVE_YES])
        ->asArray();
    if ($except) {
      $category->andWhere(['<>', 'id', $except]);
    }
    return str_replace("'", " ", json_encode($category->all()));
  }

  public static function top($params = [])// Потребляет дофига ресурсов!!!!!
  {
    $cache = \Yii::$app->cache;
    $dependency = new yii\caching\DbDependency;
    $dependencyName = 'catalog_product';
    $language = Yii::$app->params['url_prefix'];// Yii::$app->language == Yii::$app->params['base_lang'] ? false : Yii::$app->language;
    $casheName = 'products_category_top_' . Help::multiImplode('_', $params) . ($language ? '_' . $language : '');
    $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $dependencyName . '"';

    $categories = $cache->getOrSet($casheName, function () use ($params) {
      //пока для примера по количеству товара
      $count = isset($params['count']) ? $params['count'] : 5;
      $category = self::find()->from(self::tableName() . ' pc')
          ->select(['pc.id', 'pc.name', 'pc.route', 'pc.parent', 'pc.logo', 'in_top'])
          ->where(['active' => ProductsCategory::PRODUCT_CATEGORY_ACTIVE_YES])
          ->orderBy(isset($params['order']) ? $params['order'] : ['in_top' => SORT_DESC])
          ->limit($count);
      if (isset($params['parent'])) {
        $category->andWhere(['pc.parent' => $params['parent']]);
      }
//      if (!isset($params['empty']) || $params['empty'] === false) {
//          $category->innerJoin(ProductsToCategory::tablename() . ' ptc', 'ptc.category_id = pc.id')
//              ->groupBy(['pc.id', 'pc.name', 'pc.route', 'pc.parent', 'pc.logo', 'in_top'])
//              ->addSelect(['count(ptc.id) as count'])
//              ->orderBy(isset($params['order']) ? $params['order'] : ['in_top' => SORT_DESC]);
//      }
      $category = $category->all();
      return $category;
    }, $cache->defaultDuration, $dependency);

    return $categories;
  }

  public static function forFilter($params = [])
  {
    $tree = self::tree($params);
    $options = [];
    foreach ($tree as $item) {
      $options[$item['id']] = self::parentsTree($item);
      if (isset($item['childs'])) {
        foreach ($item['childs'] as $child) {
          $options[$child['id']] = self::parentsTree($child);
        }
      }
    }
    return $options;
  }

  public static function getCategoryChilds($categories, $id, $param = 'childs_ids')
  {
    foreach ($categories as $category) {
      if ($category['id'] == $id) {
        return $category[$param];
      }
      if (isset($category['childs'])) {
        $childs = self::getCategoryChilds($category['childs'], $id, $param);
        if ($childs) {
          return $childs;
        }
      }
    }
  }

  public static function getParentsArr($categories, $id, &$out)
  {
    foreach ($categories as $category) {
      if ($category['id'] == $id) {
        $out[] = $category;
        return $category['id'];
      }
      if (isset($category['childs'])) {
        $childs = self::getParentsArr($category['childs'], $id, $out);
        if ($childs) {
          $out[] = $category;
          return $childs;
        }
      }
    }
  }

  /**
   * @param $lang
   * @param array $attributes
   * @return yii\db\ActiveQuery
   */
  protected static function translated($lang, $attributes = [])
  {
    //общие для всех языков
    $selectAttributes = ['id', 'route', 'active', 'parent', 'crated_at'];
    //переводимые
    $translatedAttributes = ['name'];
    //атрибуты в запрос
    $resultAttributes = [];
    foreach ($selectAttributes as $attr) {
      if (empty($attributes) || in_array($attr, $attributes)) {
        $resultAttributes[] = 'pc.' . $attr;
      }
    }
    //переводимые
    foreach ($translatedAttributes as $attr) {
      if (empty($attributes) || in_array($attr, $attributes)) {
        /*$resultAttributes[] = $lang ?
            'if (lgcs.' . $attr . '>"",lgcs.' . $attr . ',cwcs.' . $attr . ') as ' . $attr :
            'cwcs.' . $attr;*/
        $resultAttributes[] = $lang ?
            'lgpc.' . $attr . ' as ' . $attr :
            'pc.' . $attr;
      }
    }
    $category = self::find()
        ->from(self::tableName() . ' pc')
        ->select($resultAttributes);
    if ($lang) {
      $category->leftJoin(LgProductsCategory::tableName() . ' lgpc', 'pc.id = lgpc.category_id and lgpc.language = "' . $lang . '"');
    }
    return $category;
  }

  /**
   * @return \yii\db\ActiveQuery
   */
  public function getStore()
  {
    return $this->hasOne(Stores::className(), ['uid' => 'store_id']);
  }

  /**
   * Сохранение изображения
   */
  public function saveImage()
  {
    $photo = \yii\web\UploadedFile::getInstance($this, 'logoImage');
    if ($photo && $image = SdImage::save($photo, $this->imagePath, 300, $this->logo)) {
      $this::getDb()
          ->createCommand()
          ->update($this->tableName(), ['logo' => $image], ['id' => $this->id])
          ->execute();
    }
  }
}
