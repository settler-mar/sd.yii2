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
            ['route', 'unique'],
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
        if ($this->isNewRecord) {
            $this->route = Yii::$app->help->str2url($this->name);
        }
        return parent::beforeValidate();
    }

    public static function childs($params, $parent = null, $level = 0)
    {
        $level++;
        $childs =  self::find()
            ->from(self::tableName() . ' pc')
            ->select(['pc.id', 'pc.name', 'pc.parent', 'pc.crated_at', 'pc.active', 'pc.synonym', 'pc.route'])
            ->where([
            'parent'=>$parent,
            'active'=>[self::PRODUCT_CATEGORY_ACTIVE_YES, self::PRODUCT_CATEGORY_ACTIVE_WAITING]
        ])
            ->orderBy(['name' => SORT_ASC])
            ->asArray();
        if (!empty($params['counts'])) {
            $childs->leftJoin(ProductsToCategory::tableName().' ptc', 'pc.id=ptc.category_id');
            $childs->leftJoin(Product::tableName().' p', 'p.id=ptc.product_id');
            $childs->addSelect(['count(p.id) as count']);
            $childs->groupBy(['pc.id', 'pc.name', 'pc.parent', 'pc.crated_at', 'pc.active', 'pc.synonym', 'pc.route']);
        }
        $childs = $childs->all();
        foreach ($childs as &$child) {
            $child['level'] = $level;
            $child['childs'] = self::childs($params, $child['id'], $level);
            $child['current'] = isset($params['current']) && $child['id'] == $params['current'];
        }
        return $childs;
    }

    public function afterSave($insert, $changedAttributes)
    {
        parent::afterSave($insert, $changedAttributes);
        $this->clearCache();
    }

    /**
     * @param $route
     * @return mixed
     */
    public static function byRoute($route)
    {
        $cache = \Yii::$app->cache;
        $dependency = new yii\caching\DbDependency;
        $dependencyName = 'catalog_product';
        $language = Yii::$app->language  == Yii::$app->params['base_lang'] ? false : Yii::$app->language;
        $casheName = 'products_category_byroute_' . $route . ($language ? '_'.$language: '');
        $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $dependencyName . '"';

        $category = $cache->getOrSet($casheName, function () use ($route) {
            return self::find()->where(['route' => $route])->one();
        }, $cache->defaultDuration, $dependency);
        return $category;
    }

    protected function clearCache()
    {
        Cache::deleteName('product_category_menu');
        Cache::clearName('catalog_product');
    }

}
