<?php

namespace frontend\modules\stores\models;

use yii;
use frontend\modules\stores\models\Stores;
use frontend\modules\coupons\models\CategoriesCoupons;
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
            [['parent_id', 'is_active', 'menu_index'], 'integer'],
            [['short_description', 'down_description'], 'string'],
            [['name', 'route'], 'string', 'max' => 255],
            [['route'], 'unique'],
            [['route'], 'unique', 'targetAttribute' =>'route', 'targetClass' => Stores::className()],
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
        ];
    }

    public function beforeValidate()
    {
        if (!parent::beforeValidate()) {
            return false;
        }
        if (empty($this->route)) {
            $help = new Help();
            $this->route = $help->str2url($this->name);
        }
//        if (empty($this->menu_index)) {
//            $index = CategoriesStores::find()
//                ->select(['max(menu_index) as max'])
//                ->where(['parent_id' => $this->parent_id])
//                ->asArray()
//                ->all();
//            $this->menu_index = intval($index['max']) + 1;
//        }
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
    public static function activeList()
    {
        $cache = Yii::$app->cache;
        $data = $cache->getOrSet('categories_stores', function () {
            $categories = self::find()
              ->select(['ccs.uid', 'ccs.parent_id', 'ccs.name', 'ccs.route', 'count(cstc.category_id) as count'])
              ->from([self::tableName(). ' ccs'])
              ->leftJoin('cw_stores_to_categories  cstc', 'cstc.category_id = ccs.uid')
              ->leftJoin(Stores::tableName().' cws', 'cws.uid = cstc.store_id')
              ->where(['cws.is_active' => [0, 1], 'ccs.is_active' => 1])
              ->groupBy(['ccs.name','ccs.parent_id','ccs.uid'])
              ->orderBy(['menu_index' => 'SORT_ASC', 'ccs.uid' => 'SORT_ASC'])
              ->asArray()
              ->all();
            return $categories;
        });
        return $data;
    }

    /**
     * @param int $parent_id
     * @param null $currentCategory
     * @return null|string
     */
    public static function tree($parent_id = 0, $currentCategory = null)
    {
        $cache = Yii::$app->cache;
        $dependency = new yii\caching\DbDependency;
        $dependencyName = 'category_tree';
        $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $dependencyName . '"';

        $tree = $cache->getOrSet(
          'category_tree_' . $parent_id . '_' . $currentCategory,
          function () use ($parent_id, $currentCategory) {
              $categories = self::activeList();
              $c = [];
              if (count($categories) > 0) {
                  foreach ($categories as $category) {
                      $c[$category['parent_id']][$category['uid']] = $category;
                  }

                  $cats = $c;
              } else {
                  $cats = [];
              }
              return self::buildCategoriesTree($cats, $parent_id, $currentCategory);
          },
          $cache->defaultDuration,
          $dependency
        );
        return $tree;
    }

    /**
     * @param $id
     * @return mixed
     */
    public static function byId($id)
    {
        $cache = \Yii::$app->cache;
        return $cache->getOrSet('store_category_byid_'.$id, function () use ($id) {
            return self::findOne($id);
        });
    }

    /**
     * @param $route
     * @return mixed
     */
    public static function byRoute($route)
    {
        $cache = \Yii::$app->cache;
        $category = $cache->getOrSet('store_category_byroute_' . $route, function () use ($route) {
            //return self::findOne(['route' => $route, 'is_active' => 1]);
            return self::findOne(['route' => $route]);
        });
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
                $c = $parent_id == 0 ? "class='title'" : "";
                $catURL = "/stores/" . $cat['route'];

                $tree .= "<li>";
                if ($currentCategoryId != null && $cat['uid'] == $currentCategoryId) {
                    $class = 'class="active' . ($parent_id == 0 ? ' title' : '').'"';
                    $classCount = 'class="active-count' . ($parent_id == 0 ? ' title ' : '') . '"';
                    $tree .=  '<span ' . $class . '">' . $cat['name'] . "</span> <span ".$classCount.">(" . $cat['count'] . ")</span>";
                } else {
                    $tree .=  "<a href='" . $catURL . "' " . $c . ">" . $cat['name'] . " <span>(" . $cat['count'] . ")</span></a>";
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
        Cache::clearName('catalog_stores_count');
        Cache::clearName('additional_stores');
        Cache::clearName('category_tree');
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
}
