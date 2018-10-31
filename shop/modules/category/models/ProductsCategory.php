<?php

namespace shop\modules\category\models;

use Yii;
use shop\modules\product\models\ProductsToCategory;

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
    public static function tree()
    {
        return self::childs();
    }

    public static function childs($parent = null)
    {
        $childs =  self::find()->where(['parent'=>$parent])->asArray()->all();
        foreach ($childs as &$child) {
            $child['childs'] = self::childs($child['id']);
        }
        return $childs;
    }

}
