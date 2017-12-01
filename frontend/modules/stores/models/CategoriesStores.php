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
      [['parent_id', 'is_active', 'menu_index', 'menu_hidden','selected'], 'integer'],
      [['short_description', 'down_description', 'map_icon'], 'string'],
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
      'short_description' => 'Краткое описание',
      'menu_index' => 'Позиция меню',
      'down_description' => 'Нижнее описание',
      'route' => 'Route',
      'menu_hidden' => 'Скрыто в верхнем меню',
      'map_icon' => "Иконка на карте",
      'icon_img' => "Маркер",
      'selected' => "Выделение в меню",
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
  public static function activeList($online = null)
  {
    $cache = Yii::$app->cache;
    $dependency = new yii\caching\DbDependency;
    $dependencyName = 'category_tree';
    $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $dependencyName . '"';

    $casheName = 'categories_stores ' . ($online == 1 ? '_online' : ($online === 0 ? '_offline' : ''));
    $data = $cache->getOrSet($casheName, function () use ($online) {
      $categories = self::find()
        ->select(['ccs.uid', 'ccs.parent_id', 'ccs.name', 'ccs.route', 'ccs.menu_hidden', 'ccs.selected',
          'count(cstc.category_id) as count'])
        ->from([self::tableName() . ' ccs'])
        ->leftJoin('cw_stores_to_categories  cstc', 'cstc.category_id = ccs.uid')
        ->leftJoin(Stores::tableName() . ' cws', 'cws.uid = cstc.store_id')
        ->where(['cws.is_active' => [0, 1], 'ccs.is_active' => 1])
        ->groupBy(['ccs.name', 'ccs.parent_id', 'ccs.uid'])
        ->orderBy(['selected' =>  SORT_DESC, 'menu_index' => SORT_ASC, 'ccs.uid' => SORT_ASC]);
      if ($online !== null) {
        $categories->andWhere(['cws.is_offline' => ($online == 1 ? 0 : 1)]);
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
  public static function tree($parent_id = 0, $currentCategory = null, $showHidden = true, $online = null)
  {
    $cache = Yii::$app->cache;
    $dependency = new yii\caching\DbDependency;
    $dependencyName = 'category_tree';
    $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $dependencyName . '"';
    $cacheName = 'category_tree_' . $parent_id . '_' . $currentCategory . ($showHidden == false ? '_hide_hidden' : '') .
      ($online == 1 ? '_online' : ($online === 0 ? '_offline' : ''))
      .(Yii::$app->user->isGuest ? '' : '_user_'.Yii::$app->user->id);

    $tree = $cache->getOrSet(
      $cacheName,
      function () use ($parent_id, $currentCategory, $showHidden, $online) {
        $categories = self::activeList($online);
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
        $cats[0] = array_merge(self::favoriteStores(), isset($cats[0])? $cats[0] : []);
        return self::buildCategoriesTree($cats, $parent_id, $currentCategory);
      },
      $cache->defaultDuration,
      $dependency
    );
    return $tree;
  }

  /**
   * для меню - избранные шопы
   */
  protected static function favoriteStores()
  {
      if (Yii::$app->user->isGuest) {
        return [];
      }
      $count = Stores::find()
          ->from(Stores::tableName(). ' cws')
          ->innerJoin(UsersFavorites::tableName() . ' cuf', 'cws.uid = cuf.store_id')
          ->where(["cuf.user_id" => \Yii::$app->user->id, 'cws.is_active' => [0, 1]])
          ->count();
      if ($count) {
        return [[
          'name' => 'Мои избранные',
          'parent_id' => 0,
          'route' => 'favorite',
          'menu_hidden' => 0,
          'selected' => 0,
          'count' => $count,
        ]];
      }
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
  private static function buildCategoriesTree($cats, $parent_id = 0, $currentCategoryId = null)
  {
    if (is_array($cats) and isset($cats[$parent_id])) {
      $tree = "";
      if ($parent_id != 0) {
        $tree .= "<span class=\"fa fa-caret-right fa-fa-carett\" aria-hidden=\"true\"></span>";
      }
      $tree .= "<ul data-mcs-theme=\"dark\">";

      foreach ($cats[$parent_id] as $cat) {
        $c=[];
        if($parent_id == 0){
          $c[]="title";
        }
        if($cat['selected']== 1){
          $c[]="cat_selected";
        }
        if ($cat['route'] == 'news_shops'){
          $c[]="cat_news";
        }
        if(count($c)>0){
          $c='class=\''.implode(' ',$c).'\'';
        }else{
          $c='';
        }

        $catURL = "/stores" . (strpos($cat['route'], '=') ? '?' . $cat['route'] : '/' . $cat['route']);

        $tree .= '<li '.($parent_id == 0 ? 'class="root'.(count($cats[$cat['uid']])>0 ? ' accordeon open' : '').'"':'').'>'.
          ($parent_id == 0 && count($cats[$cat['uid']])>0 ? '<span class="accordeon-arrow"><i class="fa fa-angle-up" aria-hidden="true"></i></span>' : '');//класс для аккордеона

        if ($currentCategoryId != null && $cat['uid'] == $currentCategoryId) {
          $class = 'class="active' . ($parent_id == 0 ? ' title' : '') . '"';
          $classCount = 'class="active-count' . ($parent_id == 0 ? ' title ' : '') . '"';
          $tree .= '<span ' . $class . '">' . $cat['name'] . "</span> <span " . $classCount . ">(" . $cat['count'] . ")</span>";
        } else {
          $tree .= "<a href='" . $catURL . "' " . $c . ">" . $cat['name'] . " <span>(" . $cat['count'] . ")</span></a>";
        }
        $tree .= self::buildCategoriesTree($cats, $cat['uid'], $currentCategoryId);
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
}
