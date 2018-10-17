<?php

namespace frontend\modules\product\models;

use Yii;

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
    public $parentName;
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
            'parentName' => 'Родительская категория'
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getProductsToCategories()
    {
        return $this->hasMany(ProductsToCategory::className(), ['category_id' => 'id']);
    }

}
