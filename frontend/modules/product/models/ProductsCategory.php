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

  public $full_path = false;
  public $parentNames = [];
  public $childCategoriesId = false;
  protected $activeTree = false;
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

  public function makeFromTreeData($category)
  {
    $this->childCategoriesId = isset($category['children_id']) ? $category['children_id'] : [];
    $this->childCategoriesId[] = $category['id'];
    $this->parentNames = $category['names'];
    $this->full_path = explode('/', $category['full_route']);
  }

  public function childCategoriesId()
  {
    if ($this->childCategoriesId === false) {
      if (!$this->full_path) {
        $this->full_path = self::getParents($this->id);
      };
      $path = [];
      foreach ($this->full_path as $item) {
        $path[] = $item['route'];
      }
      self::byRoute($path, $this);
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
    $areas = isset($params['is_admin']) && $params['is_admin'] ? [] : Yii::$app->params['location']['areas'];

    if(!isset($params['key']))$params['key']='route';

    $cacheName =
        'catalog_categories_menu_' .
        Yii::$app->params['url_prefix'] . ':' .
        implode('_', $areas) .
        (!empty($params) ? ':' . Help::multiImplode('_', $params) : '');

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

    $areas_where = array_merge([
        'or',
        ['=', 'JSON_LENGTH(`cs`.`regions`)', 0],
        ['is', '`regions`', null],
    ], $areas_where);

    $out = $cache->getOrSet(
        $cacheName,
        function () use ($params, $language, $dependency, $areas_where, $cacheName) {
          $cacheName = str_replace('catalog_categories_menu_', 'dir_children_list_', $cacheName);
          $t = self::getChildrens($params, null, $language, $areas_where, $cacheName);
          if (empty($t)) return [];

          $children = [];
          foreach ($t as $el) {
            $active = $el['active'] == self::PRODUCT_CATEGORY_ACTIVE_YES || empty($params['active_only']);
            if ($el['count_all'] > 0 && $active) {
              $children[$el[$params['key']]] = $el;
            }
          }
          if (!empty($children)) {
            if(isset($params['flat'])&&$params['flat']){
              return Yii::$app->help->arrayToFlat($children,'children');
              //return $categoryArr;
            }
            return $children;
          }
          return [];
        },
        $cache->defaultDuration,
        $dependency
    );
    return $out;
  }

  private static function getChildrens($params, $parent, $language, $areas_where, $cacheName, $max_level = 20, $start_route = '', $names = [])
  {
    if ($max_level == 0) return false;

    if (!isset(Yii::$app->params[$cacheName])) {
      $cache = \Yii::$app->cache;
      $dependency = new yii\caching\DbDependency;
      $dependencyName = 'catalog_product';
      $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $dependencyName . '"';

      Yii::$app->params[$cacheName] = $cache->getOrSet(
          $cacheName,
          function () use ($language, $dependency, $areas_where) {

            $categoryArr = self::translated($language, ['id', 'name', 'active', 'route'])
                ->orderBy(['menu_index' => SORT_ASC, 'name' => SORT_ASC])
                ->andWhere(['synonym' => null])
                ->andWhere([
                    'or',
                    ['s.is_active' => [0, 1]],//шоп активен
                    ['s.is_active' => null]
                ]);

            $categoryArr
                ->leftJoin(ProductsToCategory::tableName() . ' ptc', 'pc.id = ptc.category_id')
                ->leftJoin(Product::tableName() . ' p', 'p.id = ptc.product_id')
                ->leftJoin(Stores::tableName() . ' s', 's.uid = p.store_id')
                ->groupBy(['pc.id', 'pc.name', 'pc.parent', 'pc.active', 'route', 'parent'])
                ->addSelect(['count(ptc.id) as count_all', 'parent']);

            if (!empty($areas_where)) {
              $categoryArr->leftJoin(CatalogStores::tableName() . ' cs', 'cs.id = p.catalog_id');
              $categoryArr->andWhere($areas_where);
            }

            $categoryArr = $categoryArr->asArray()->all();

            $out = [];
            foreach ($categoryArr as $category) {
              $parant_id = $category['parent'];
              if (empty($parant_id)) $parant_id = 0;
              if (!isset($out[$parant_id])) $out[$parant_id] = [];
              unset($category['parent']);
              $out[$parant_id][] = $category;
            }
            return $out;
          },
          $cache->defaultDuration,
          $dependency
      );
    }

    if (empty($parent)) $parent = 0;
    $categoryArr = isset(Yii::$app->params[$cacheName][$parent]) ? Yii::$app->params[$cacheName][$parent] : [];

    foreach ($categoryArr as &$item) {
      $item['full_route'] = trim($start_route . '/' . $item['route'], '/');
      $item['names'] = array_merge($names, [$item['name']]);//Названия путей
      $t = self::getChildrens($params, $item['id'], $language, $areas_where, $cacheName, $max_level - 1, $item['full_route'], $item['names']);
      if (!empty($t)) {
        $children = [];
        $item['children_id'] = [];
        foreach ($t as $el) {
          $active = $el['active'] == self::PRODUCT_CATEGORY_ACTIVE_YES || empty($params['active_only']);
          $item['count_all'] += ($active ? $el['count_all'] : 0);
          if ($el['count_all'] > 0 && $active) {
            $children[$el[$params['key']]] = $el;
          }

          if ($el['count_all'] > 0 && $active) {
            $item['children_id'][] = $el['id'];
            if (!empty($el['children_id'])) $item['children_id'] =
                yii\helpers\ArrayHelper::merge($el['children_id'], $item['children_id']);
          }
        }
        if (!empty($children)) {
          $item['children'] = $children;
        }
      };
    }
    return $categoryArr;
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
  public static function byRoute($route, $category_db = false, $params = []) //обновил
  {

    $cache = \Yii::$app->cache;
    $dependency = new yii\caching\DbDependency;
    $dependencyName = 'catalog_product';
    $language = Yii::$app->language == Yii::$app->params['base_lang'] ? false : Yii::$app->language;
    $casheName = 'products_category_byroute_' . implode('_', $route) . Yii::$app->params['url_prefix'] .
        (!empty($params) ? '_' . Yii::$app->help->multiImplode('_', $params) : '');
    $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $dependencyName . '"';

    $category = $cache->getOrSet($casheName, function () use ($route, $language, $params) {
      $tree = self::tree($params);
      $category = null;
      foreach ($route as $item_route) {
        if (!isset($tree[$item_route])) return null;
        $category = $tree[$item_route];

        $tree = isset($tree[$item_route]['children']) ?
            $tree[$item_route]['children'] :
            [];
      }
      return $category;
    }, $cache->defaultDuration, $dependency);

    if (empty($category)) {
      return null;
    }
    if (!$category_db) {
      $category_db = self::translated($language)->where(['id' => $category['id']])->one();
    }

    $category_db->makeFromTreeData($category);
    return $category_db;
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

  public static function forFilter($hasChildren = true, $params = [])
  {
    $tree = self::tree($params);
    $options = [];
    foreach ($tree as $item) {
      if (!$hasChildren || isset($item['children'])) {
        $options[$item['id']] = self::parentsTree($item);
      } else {
        continue;
      }

      if (isset($item['children'])) {
        foreach ($item['children'] as $child) {
          if (!$hasChildren || isset($child['children'])) {
            $options[$child['id']] = self::parentsTree($child);
          } else {
            continue;
          }
        }
      }
    }
    return $options;
  }

  public static function getCategoryChilds($categories, $id, $param = 'children_id')
  {
    $data = isset($categories[$id]) &&
    isset($categories[$id]['children_id']) ?
        $categories[$id]['children_id'] : [];

    $data[] = $id;
    return $data;
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
