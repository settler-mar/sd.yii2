<?php

namespace shop\modules\category\models;

use yii;
use shop\modules\product\models\ProductsToCategory;
use shop\modules\product\models\Product;
use frontend\modules\cache\models\Cache;
use common\components\Help;

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
            [['name', 'route'], 'required'],
            [['name', 'route'], 'string', 'max' => 255],
            [['parent'], 'exist', 'targetAttribute' => 'id'],
            [['active', 'synonym'], 'integer'],
            ['route', 'unique', 'targetAttribute' => ['route', 'parent']],
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
            'active' => 'Активна'
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

    public function getSynonymCategory()
    {
        if ($this->synonym ==  null) {
            return null;
        }
        return $this->hasOne(self::className(), ['id' => 'synonym']);
    }

    public function getSynonyms()
    {
        return $this->hasMany(self::className(), ['synonym' => 'id']);
    }

    public function beforeValidate()
    {
        if (empty($this->route) && $this->isNewRecord &&
            (!isset(Yii::$app->request->pathInfo) || strpos(Yii::$app->request->pathInfo, 'admin') !== 0)) {
            $this->route = Yii::$app->help->str2url($this->name);
        }
        return parent::beforeValidate();
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
                    $categories = static::parents($categories, $level+1);
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

    public static function getParents($id,$categories_db = false){
      $categories=[];

      if(!$categories_db) {
        $categories_db=Yii::$app->globals->get('product_categories');

        if(empty($categories_db)) {
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
      }else{
        Yii::$app->globals->set('product_categories',$categories_db);
      }

      while(!empty($id)){
        $item=$categories_db[$id];
        $categories[]=$item;
        $id=empty($item['parent'])?null:$item['parent'];
      }

      return $categories;
    }
    /**
     * @param $category
     * @param int $mode 0 - names, 1 - roures, 2 - links to edit
     * @return string
     */
    public static function parentsTree($category, $mode = 0,$categories=false,$max_lavel = false)
    {
      $out = [];
      //$categories = static::parents([$category],0,$categories);
      if(is_object($category)){
        $category=$category->id;
      }elseif(is_array($category)){
        $category=$category['id'];
      }

      $categories = static::getParents($category,$categories);

      for ($i = count($categories) - 1; $i >= 0; $i--) {
          if(empty($categories[$i]))continue;
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
        $cacheName = 'catalog_categories_menu' . (!empty($params) ? Help::multiImplode('_', $params) : '') .
            ($language ? '_' . $language : '');
        $cache = \Yii::$app->cache;
        $dependency = new yii\caching\DbDependency;
        $dependencyName = 'catalog_product';
        $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $dependencyName . '"';

        $out = $cache->getOrSet(
            $cacheName,
            function () use ($params, $language) {
                $categoryArr = self::translated($language, ['id', 'name', 'parent', 'active', 'route'])
                    ->asArray();
                if (isset($params['where'])) {
                    $categoryArr->where($params['where']);
                };
                $categoryArr = $categoryArr->all();
                $current = isset($params['current']) ? $params['current'] : false;
                $categories = static::childsCategories($categoryArr, false, $current);

                if ($categories && !empty($params['counts'])) {
                    foreach ($categories as &$rootCategory) {
                        //пока количество для корневых категорий
                        $rootCategory['count'] = ProductsToCategory::find()
                            ->where(['category_id' => $rootCategory['childs_ids']])
                            ->count();
                    }
                }
                return $categories;
            },
            $cache->defaultDuration,
            $dependency
        );
        return $out;
    }

    protected static function childsCategories($arr, $parent, $current = false)
    {
        $out = [];
        foreach ($arr as $cat) {
            if ($cat['parent'] == ($parent ? $parent['id'] : null)) {
                $cat['full_route'] = $parent ? $parent['full_route'].'/'.$cat['route'] : $cat['route'];
                $cat['current'] = $cat['id'] == $current;
                $cat['childs'] = static::childsCategories($arr, $cat, $current);
                $cat['childs_ids'] = [$cat['id']];//в дочерние ид впишем свой ид
                if ($cat['childs']) {
                    foreach ($cat['childs'] as $child) {
                        if ($child['childs_ids']) {
                            $cat['childs_ids'] = array_merge($cat['childs_ids'], $child['childs_ids']);
                        }
                        if ($child['current']) {
                            //если дочерняя текущая, то сама тоже текущая
                            $cat['current'] = true;
                        }
                    }
                }
                $out[] = $cat;
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

        parent::afterSave($insert, $changedAttributes);
        $this->clearCache();
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
        $casheName = 'products_category_byroute_' . implode('_', $route) . ($language ? '_' . $language : '');
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
        $language = Yii::$app->language == Yii::$app->params['base_lang'] ? false : Yii::$app->language;
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
            ->where(['synonym' => null])
            ->asArray();
        if ($except) {
            $category->andWhere(['<>', 'id', $except]);
        }
        return str_replace("'", " ", json_encode($category->all()));
    }

    public static function top($params = [])
    {
        $cache = \Yii::$app->cache;
        $dependency = new yii\caching\DbDependency;
        $dependencyName = 'catalog_product';
        $language = Yii::$app->language == Yii::$app->params['base_lang'] ? false : Yii::$app->language;
        $casheName = 'products_category_top_' . implode('_', $params) . ($language ? '_' . $language : '');
        $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $dependencyName . '"';

        $categories = $cache->getOrSet($casheName, function () use ($params) {
            //пока для примера по количеству товара
            $count = isset($params['count']) ? $params['count'] : 5;
            $category = self::find()->from(self::tableName() . ' pc')
                ->innerJoin(ProductsToCategory::tablename() . ' ptc', 'ptc.category_id = pc.id')
                ->select(['pc.id', 'pc.name', 'pc.route', 'pc.parent', 'count(ptc.id) as count'])
                ->groupBy(['pc.id', 'pc.name', 'pc.route', 'pc.parent'])
                ->orderBy(['count' => SORT_DESC])
                ->limit($count);
            if (isset($params['parent'])) {
                $category->andWhere(['pc.parent' => $params['parent']]);
            }
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

    public static function getCategoryChilds($categories, $id)
    {
        foreach ($categories as $category) {
            if ($category['id'] == $id) {
                return $category['childs_ids'];
            }
            if (isset($category['childs'])) {
                $childs =  self::getCategoryChilds($category['childs'], $id);
                if ($childs) {
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
        foreach ($selectAttributes as $attr){
            if (empty($attributes) || in_array($attr, $attributes)) {
                $resultAttributes[] = 'pc.'.$attr;
            }
        }
        //переводимые
        foreach ($translatedAttributes as $attr) {
            if (empty($attributes) || in_array($attr, $attributes)) {
                /*$resultAttributes[] = $lang ?
                    'if (lgcs.' . $attr . '>"",lgcs.' . $attr . ',cwcs.' . $attr . ') as ' . $attr :
                    'cwcs.' . $attr;*/
                $resultAttributes[] = $lang ?
                    'lgpc.'.$attr . ' as ' . $attr :
                    'pc.' . $attr;
            }
        }
        $category = self::find()
            ->from(self::tableName(). ' pc')
            ->select($resultAttributes);
        if ($lang) {
            $category->leftJoin(LgProductsCategory::tableName(). ' lgpc', 'pc.id = lgpc.category_id and lgpc.language = "' . $lang . '"');
        }
        return $category;
    }


}
