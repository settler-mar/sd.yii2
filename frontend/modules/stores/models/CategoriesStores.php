<?php

namespace frontend\modules\stores\models;

use yii;
use frontend\modules\stores\models\Stores;
use frontend\modules\coupons\models\CategoriesCoupons;
use frontend\modules\favorites\models\UsersFavorites;
use common\components\Help;
use frontend\modules\cache\models\Cache;

/**
 * This is the model class for table "cw_categories_stores".
 *
 * @property integer $uid
 * @property integer $parent_id
 * @property string $name
 * @property integer $is_active
 * @property string $short_description
 * @property integer $menu_index
 * @property string $down_description
 */
class CategoriesStores extends \yii\db\ActiveRecord
{
  const CATEGORY_STORE_SELECTED_NONE = 0;
  const CATEGORY_STORE_SELECTED_PROMO = 1;
  const CATEGORY_STORE_SELECTED_GREEN = 2;
  /**
   * @inheritdoc
   */
  public static function tableName()
  {
    return 'cw_categories_stores';
  }

  /**
   * @inheritdoc
   */
  public function rules()
  {
    return [
      [['parent_id', 'name', 'route'], 'required'],
      [['parent_id', 'is_active', 'menu_index', 'menu_hidden','show_in_footer'], 'integer'],
      [['short_description', 'down_description', 'short_description_offline', 'down_description_offline', 'map_icon'], 'string'],
      [['selected'], 'in', 'range' => [0, 1, 2]],
      [['name', 'route'], 'string', 'max' => 255],
      [['route'], 'unique'],
      [['route'], 'unique', 'targetAttribute' => 'route', 'targetClass' => Stores::className()],
      //[['route'], 'unique', 'targetAttribute' =>'route', 'targetClass' => CategoriesCoupons::className()],
    ];
  }

  /**
   * @inheritdoc
   */
  public function attributeLabels()
  {
    return [
      'uid' => 'Uid',
      'parent_id' => 'ID родительской категории',
      'name' => 'Имя',
      'is_active' => 'Состояние',
      'short_description' => 'Краткое описание онлайн',
      'short_description_offline' => 'Краткое описание оффлайн',
      'menu_index' => 'Позиция меню',
      'down_description' => 'Нижнее описание онлайн',
      'down_description_offline' => 'Нижнее описание оффлайн',
      'route' => 'Route',
      'menu_hidden' => 'Скрыто в верхнем меню',
      'map_icon' => "Иконка на карте",
      'icon_img' => "Маркер",
      'selected' => "Выделение в меню",
      'show_in_footer' => "Отображать в подвале",
    ];
  }

  public function getIcon()
  {
    $icons = Yii::$app->params['dictionary']['map_icons'];
    if (!$this->map_icon || !isset($icons[$this->map_icon])) {
      return false;
    };
    return $icons[$this->map_icon];
  }

  public function getIcon_img()
  {
    $icon = $this->getIcon();
    if (!$icon) {
      return "Не заданна";
    };
    return '<img src="' . $icon . '">';
  }

  public function beforeValidate()
  {

    if (!parent::beforeValidate()) {
      return false;
    }
    if (empty($this->route)) {
      $this->route = Help::str2url($this->name);
    }
    if (empty($this->menu_index)) {
      $index = CategoriesStores::find()
        ->select(['max(menu_index) as max'])
        ->where(['parent_id' => $this->parent_id])
        ->asArray()
        ->one();
      $this->menu_index = intval($index['max']) + 1;
    }
    return true;
  }

  /**
   * @return array|yii\db\ActiveRecord[]
   */
  public function getChildrens()
  {
    return CategoriesStores::find()->where(['parent_id' => $this->uid])->all();
  }

  /**
   * магазины категории
   * @return $this
   */
  public function getStores()
  {
    return $this->hasMany(Stores::className(), ['uid' => 'store_id'])
      ->viaTable('cw_stores_to_categories', ['category_id' => 'uid']);
  }

  /**
   * @return mixed
   */
  public static function activeList($offline = null,$where=false,$as_array=false)
  {
    $cache = Yii::$app->cache;
    $dependency = new yii\caching\DbDependency;
    $dependencyName = 'category_tree';
    $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $dependencyName . '"';

    $casheName = 'categories_stores' . ($offline == 1 ? '_offline' : ($offline === 0 ? '_online' : ''));

    if($where){
      $casheName .= '_'.str_replace(' ','_',$where);
    }

    $data = $cache->getOrSet($casheName, function () use ($offline,$where,$as_array) {
      $categories = self::find()
        ->from([self::tableName() . ' ccs'])
        ->leftJoin('cw_stores_to_categories  cstc', 'cstc.category_id = ccs.uid')
        ->leftJoin(Stores::tableName() . ' cws', 'cws.uid = cstc.store_id')
        ->orderBy(['selected' => SORT_DESC, 'menu_index' => SORT_ASC, 'ccs.uid' => SORT_ASC]);
      if ($offline == 1) {
        $categories->where(['cws.is_offline' => 1]);
      }
      if ($where) {
        $categories
          ->select(['ccs.uid', 'ccs.parent_id', 'ccs.name', 'ccs.route', 'ccs.menu_hidden', 'ccs.selected', 'ccs.menu_index'])
          ->andWhere($where);
      }else{
        $categories
          ->select(['ccs.uid', 'ccs.parent_id', 'ccs.name', 'ccs.route', 'ccs.menu_hidden', 'ccs.selected', 'ccs.menu_index',
                'count(cstc.category_id) as count'])
          ->andWhere(['cws.is_active' => [0, 1], 'ccs.is_active' => 1])
          ->groupBy(['ccs.name', 'ccs.parent_id', 'ccs.uid']);
      }
      $categories = $categories->asArray()->all();
      return $categories;
    }, $cache->defaultDuration, $dependency);
    return $data;
  }

  /**
   * @param int $parent_id
   * @param null $currentCategory
   * @return null|string
   */
  public static function tree($currentCategory = null, $options = [])
  {
    $showHidden = isset($options['show_hidden']) ? $options['show_hidden'] : true;
    $offline = isset($options['offline']) ? $options['offline'] : null;
    $extItems = isset($options['ext_items']) ? $options['ext_items'] : [];
    $as_array = isset($options['as_array']) ? $options['as_array'] : false;
    $where = isset($options['where']) ? $options['where'] : false;

    $cache = Yii::$app->cache;
    $dependency = new yii\caching\DbDependency;
    $dependencyName = 'category_tree';

    $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $dependencyName . '"';
    $cacheName = 'category_tree';
    if($where){
      $cacheName .= '_'.str_replace(' ','_',$where);
    }else{
      $cacheName .= ($showHidden == false ? '_hide_hidden' : '') .
          ($offline == 1 ? '_offline' : ($offline === 0 ? '_online' : ''))
          . (Yii::$app->user->isGuest ? '' : '_user_' . Yii::$app->user->id);
    }
    $cats = $cache->getOrSet(
      $cacheName,
      function () use ($currentCategory, $showHidden, $offline, $as_array, $where) {
        $categories = self::activeList($offline, $where, $as_array);

        if($as_array){
          return $categories;
        };

        $c = [];
        if (count($categories) > 0) {
          foreach ($categories as $category) {
            if ($showHidden == false && $category['menu_hidden'] == 1) {
              //не включаем в меню, если включена опция и категория скрыта
              continue;
            }
            $c[$category['parent_id']][$category['uid']] = $category;
          }

          $cats = $c;
        } else {
          $cats = [];
        }

        return $cats;
      },
      $cache->defaultDuration,
      $dependency
    );
    if($as_array){
      return json_encode($cats);
    }

    //избранные шопы
    $cats[0] = isset($cats[0]) ? $cats[0] : [];
    if (in_array('favorite', $extItems)) {
      $favoriteCount = UsersFavorites::userFavoriteCount();
      if ($favoriteCount > 0) {
        array_unshift($cats[0], [
          'name' => 'Мои избранные',
          'parent_id' => 0,
          'route' => 'favorite',
          'menu_hidden' => 0,
          'selected' => '0',
          'count' => $favoriteCount,
          'uid' => null,
          'menu_index' => -1000,
          'class' => 'cat_bold',
        ]);
      }
    }
    if (in_array('all_shops', $extItems)) {
      array_unshift($cats[0], [
        'name' => 'Все магазины',
        'parent_id' => 0,
        'route' => '',
        'menu_hidden' => 0,
        'selected' => '0',
        'count' => Stores::activeCount(),
        'uid' => null,
        'menu_index' => 1000,
        'class' => 'all_shops cat_bold cat_upper',
      ]);
    }

    //перемещаем выделенные категории вверх
    usort($cats[0], function ($current, $next) {
      if($next['selected']!=$current['selected']){
        if($next['selected']==self::CATEGORY_STORE_SELECTED_PROMO)return 1;
        if($current['selected']==self::CATEGORY_STORE_SELECTED_PROMO)return -1;
      }
      if($current['menu_index'] > $next['menu_index'])return 1;
      if($current['menu_index'] < $next['menu_index'])return -1;
      return 0;
    });

    return self::buildCategoriesTree($cats, 0, $currentCategory, $offline);
  }

  /**
   * @param $id
   * @return mixed
   */
  public static function byId($id)
  {
    $cache = \Yii::$app->cache;
    $dependency = new yii\caching\DbDependency;
    $dependencyName = 'catalog_stores';
    $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $dependencyName . '"';

    return $cache->getOrSet('store_category_byid_' . $id, function () use ($id) {
      return self::findOne($id);
    }, $cache->defaultDuration, $dependency);
  }

  /**
   * @param $route
   * @return mixed
   */
  public static function byRoute($route)
  {
    if (strpos($route, '-offline') === strlen($route) - strlen('-offline')) {
          //если в конце категории слово -offline
          $route = substr($route, 0, strlen($route) - strlen('-offline'));
    }
    $cache = \Yii::$app->cache;
    $dependency = new yii\caching\DbDependency;
    $dependencyName = 'catalog_stores';
    $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $dependencyName . '"';

    $category = $cache->getOrSet('store_category_byroute_' . $route, function () use ($route) {
      //return self::findOne(['route' => $route, 'is_active' => 1]);
      return self::findOne(['route' => $route]);
    }, $cache->defaultDuration, $dependency);
    return $category;
  }

  /**
   * @param $cats
   * @param int $parent_id
   * @param null $currentCategory
   * @return null|string
   */
  private static function buildCategoriesTree($cats, $parent_id = 0, $currentCategoryId = null, $offline = null)
  {
    if (is_array($cats) and isset($cats[$parent_id])) {

      $tree = "<ul>";

      foreach ($cats[$parent_id] as $cat) {
        $c=[];
        $itemClass=[];
        $title = false;
        if($parent_id == 0){
          $c[]="title";
        }

        if (!empty(($cat['class']))) {
            //d($cat['class']);
            $itemClass[] = $cat['class'];
            $c[] = $cat['class'];
        }
        switch ($cat['selected']) {
          case self::CATEGORY_STORE_SELECTED_PROMO:
            $c[] = 'cat_selected';
            break;
          case self::CATEGORY_STORE_SELECTED_GREEN:
            $c[] = 'cat_news';
            break;
        }
        if ($currentCategoryId != null && isset($cat['uid']) && $cat['uid'] == $currentCategoryId ||
              $cat['route'] == 'favorite' && Yii::$app->request->pathInfo == 'stores/favorite'||
              $cat['route'] == '' && Yii::$app->request->pathInfo == 'stores'
          ){
            $title = true;
            $c[] = 'active';
            $itemClass[] = 'active';
          }

        if(count($c)>0){
          $c='class=\''.implode(' ',$c).'\'';
        }else{
          $c='';
        }

        $catURL = "/stores" . (($cat['route'] != '') ? '/' . $cat['route'] : '');

        //имеются дочерние категрии
        $childCategories = $parent_id == 0 && isset($cat['uid']) && isset($cats[$cat['uid']]) &&  count($cats[$cat['uid']])>0;
        if ($childCategories) {
            $arrow = "{{ svg('angle-down', 'menu_angle-down')|raw }}";
        } else {
            $arrow = '';
        }
        //open  - если пустая настройка, или (имеются дочерние и имеется текущая категория и (текущая в ключах подкатегории, или текущая как корневая категория)
        if ($childCategories && $currentCategoryId &&
          (in_array($currentCategoryId, array_keys($cats[$cat['uid']])) || $currentCategoryId == $cat['uid'])){
            $itemClass[] = 'open current';
          }
        if ($childCategories) {
            $itemClass[] = 'menu-group';
        }

        if(count($itemClass)>0){
          $itemClass='class=\''.implode(' ',$itemClass).'\'';
        }else{
          $itemClass='';
        }
        $tree .= '<li '.$itemClass . '>';

        if ($cat['route'] == 'favorite') {
            $onlineLink = '';
        } elseif ($offline === 1) {
            $onlineLink = '-offline';
        } elseif ($offline === 0) {
            $onlineLink = '';//'-online';
        } else {
            $onlineLink = '';
        }

        if ($title) {
          $tree .= '<span ' . $c . '">' . $cat['name'] . "&nbsp;(" . $cat['count'] . ")". $arrow . "</span>";
        } else {
          $tree .= "<a href='" . $catURL . $onlineLink . "' " . $c .  ">" . $cat['name'] . "&nbsp;(" . $cat['count'] . ") ".
            $arrow . "</a>";
        }
        $tree .= ($childCategories ? self::buildCategoriesTree($cats, $cat['uid'], $currentCategoryId, $offline) : '');
        $tree .= "</li>";
      }
      $tree .= "</ul>";
    } else {
      return null;
    }

    return $tree;
  }

  /**
   * @param bool $insert
   * @param array $changedAttributes
   * чистим кеш
   */
  public function afterSave($insert, $changedAttributes)
  {
    self::clearCache($this->uid);
  }

  /**
   * чистим кеш
   */
  public function afterDelete()
  {
    self::clearCache($this->uid);
  }

  /**
   * @param $id
   * очистка кеш
   */
  public static function clearCache($id = null, $route = null)
  {

    //зависимости
    Cache::clearName('catalog_stores');
    Cache::clearName('additional_stores');
    Cache::clearName('category_tree');
    Cache::clearName('coupons_counts');
    //ключи
    Cache::deleteName('total_all_stores');
    Cache::deleteName('top_12_stores');
    Cache::deleteName('categories_stores');
    if ($id) {
      Cache::deleteName('store_category_byid' . $id);
    }
    if ($route) {
      Cache::deleteName('store_category_byroute_' . $route);
    }
  }

  public function getParentName()
  {
    if ($this->parent_id == 0) {
      return '<Корень>';
    }
    $cat = CategoriesStores::findOne($this->parent_id);
    return $cat ? $cat->name : 'Ошибка вывода';
  }

  public static function getParentsList($base = array())
  {
    $cat = CategoriesStores::find()
      ->where(['parent_id' => 0])
      ->asArray()
      ->all();
    $base[0] = '<Корень>';
    foreach ($cat as $item) {
      $base[$item['uid']] = $item['name'];
    }

    return $base;
  }

  protected static function compareSelected($current, $next)
  {
    return $current['selected'] == $next['selected'] ?
      0 : ($current['selected'] > $next['selected'] ? 1 : -1);
  }
}
