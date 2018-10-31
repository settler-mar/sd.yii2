<?php

namespace shop\modules\category\models;

use Yii;
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
            [['name'], 'string', 'max' => 255],
            [['parent'], 'exist', 'targetAttribute' => 'id'],
            [['active', 'synonym'], 'integer']
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

    public static function childs($params, $parent = null, $level = 0)
    {
        $level++;
        $childs =  self::find()
            ->from(self::tableName() . ' pc')
            ->select(['pc.id', 'pc.name', 'pc.parent', 'pc.crated_at', 'pc.active', 'pc.synonym'])
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
            $childs->groupBy(['pc.id', 'pc.name', 'pc.parent', 'pc.crated_at', 'pc.active', 'pc.synonym']);
        }
        $childs = $childs->all();
        foreach ($childs as &$child) {
            $child['lever'] = $level;
            $child['childs'] = self::childs($params, $child['id'], $level);
        }
        return $childs;
    }

    public function afterSave($insert, $changedAttributes)
    {
        parent::afterSave($insert, $changedAttributes);
        $this->clearCache;
    }

    protected function clearCache()
    {
        Cache::deleteName('product_category_menu');
    }

}
