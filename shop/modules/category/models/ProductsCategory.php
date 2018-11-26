<?php

namespace shop\modules\category\models;

use yii;
use shop\modules\product\models\ProductsToCategory;
use shop\modules\product\models\Product;
use frontend\modules\cache\models\Cache;

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
        return $this->hasOne(self::className(), ['id' => 'synonym']);
    }
    public function getSynonyms()
    {
        return $this->hasMany(self::className(), ['synonym' => 'id']);
    }

    /**
     * дерево категорий
     * @return array|\yii\db\ActiveRecord[]
     */
    public static function tree($params=[])
    {
        return self::childs($params);
    }

    public function beforeValidate()
    {
        if ($this->isNewRecord && (!isset(Yii::$app->request->pathInfo) || strpos(Yii::$app->request->pathInfo, 'admin') !== 0)) {
            $this->route = Yii::$app->help->str2url($this->name);
        }
        return parent::beforeValidate();
    }

    /**
     * сама категория и все родительские по очереди
     * @param $categories
     * @return array
     */
    public static function parents($categories)
    {
        if ($categories[count($categories)-1]->parent != null) {
            $parent = self::findOne($categories[count($categories)-1]->parent);
            if ($parent) {
                $categories[] = $parent;
                $categories = static::parents($categories);
            }
        }
        return $categories;
    }

    public static function parentsTree($category, $route = false)
    {
        $out = [];
        $categories = static::parents([$category]);
        for ($i = count($categories) - 1; $i >= 0; $i--) {
            $out[] = $route ? $categories[$i]->route : $categories[$i]->name;
        }
        return implode($route ? '/' :' / ', $out);
    }

    public static function childs($params, $parent = null, $level = 0)
    {
        $level++;
        $childs =  self::find()
            ->from(self::tableName() . ' pc')
            ->select(['pc.id', 'pc.name', 'pc.parent', 'pc.active', 'pc.synonym', 'pc.route'])
            ->where([
            'parent'=>$parent,
            'active'=>[self::PRODUCT_CATEGORY_ACTIVE_YES, self::PRODUCT_CATEGORY_ACTIVE_WAITING]
            ])
            ->orderBy(['name' => SORT_ASC]);
        $childs = $childs->all();
        $out = [];
        foreach ($childs as $key => $child) {
            $count = 0;
            if (!empty($params['counts'])) {
                //считать количество в т.ч. по дочерним категориям
                $count = Product::find()->from(Product::tableName().' p')
                    ->innerJoin(ProductsToCategory::tableName().' ptc', 'p.id=ptc.product_id')
                    ->where(['category_id' => self::childsId($child->id)])
                    ->count();
            }
            if (isset($params['empty']) && $params['empty'] === false &&
                ($count === '0' || $count === null )) {
                //если задано, то пустые не выводить
                continue;
            }
            $item = $child->toArray();
            $item['level'] = $level;
            $item['childs'] = self::childs($params, $child->id, $level);
            $item['current'] = isset($params['current']) && $child->id == $params['current'];
            $item['count'] = $count;
            $item['route'] = static::parentsTree($child, true);
            $out[] = $item;
        }
        return $out;
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
                'active'=> [self::PRODUCT_CATEGORY_ACTIVE_YES, self::PRODUCT_CATEGORY_ACTIVE_WAITING]
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
        $language = Yii::$app->language  == Yii::$app->params['base_lang'] ? false : Yii::$app->language;
        $casheName = 'products_category_byroute_' . implode('_', $route) . ($language ? '_'.$language: '');
        $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $dependencyName . '"';

        $category = $cache->getOrSet($casheName, function () use ($route) {
            $parent = null;
            foreach ($route as $routePart) {
                $category = self::find()->where(['route' => $routePart, 'parent' => $parent])->one();
                if (!$category) {
                    return false;
                }
                $parent = $category->id;
            }
            return $category;
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
            ->select(['id', 'name', 'parent'])
            ->orderBy(['name' => SORT_ASC])
            ->asArray();
        if ($except) {
            $category->where(['<>', 'id', $except]);
        }
        return str_replace("'", " ", json_encode($category->all()));
    }

    public static function top($params = [])
    {
        $cache = \Yii::$app->cache;
        $dependency = new yii\caching\DbDependency;
        $dependencyName = 'catalog_product';
        $language = Yii::$app->language  == Yii::$app->params['base_lang'] ? false : Yii::$app->language;
        $casheName = 'products_category_top_' . implode('_', $params) . ($language ? '_'.$language: '');
        $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $dependencyName . '"';

        $categories = $cache->getOrSet($casheName, function () use ($params) {
            //пока для примера по количеству товара
            $count = isset($params['count']) ? $params['count'] : 5;
            $category = self::find()->from(self::tableName(). ' pc')
                ->innerJoin(ProductsToCategory::tablename().' ptc', 'ptc.category_id = pc.id')
                ->select(['pc.id', 'pc.name', 'pc.route', 'pc.parent', 'count(ptc.id) as count'])
                ->groupBy(['pc.id', 'pc.name', 'pc.route', 'pc.parent'])
                ->orderBy(['count' => SORT_DESC])
                ->limit($count)
                ->all();
            return $category;
        }, $cache->defaultDuration, $dependency);

        return $categories;
    }


}
