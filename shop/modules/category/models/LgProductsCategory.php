<?php

namespace shop\modules\category\models;

use Yii;

/**
 * This is the model class for table "lg_products_category".
 *
 * @property integer $id
 * @property integer $category_id
 * @property string $language
 * @property string $name
 *
 * @property CwProductsCategory $category
 */
class LgProductsCategory extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'lg_products_category';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['category_id', 'language'], 'required'],
            [['name'], 'required', 'enableClientValidation' => false],
            [['category_id'], 'integer'],
            [['language'], 'string', 'max' => 10],
            [['name'], 'string', 'max' => 255],
            [['category_id', 'language'], 'unique', 'targetAttribute' => ['category_id', 'language'], 'message' => 'The combination of Category ID and Language has already been taken.'],
            [['category_id'], 'exist', 'skipOnError' => true, 'targetClass' => ProductsCategory::className(), 'targetAttribute' => ['category_id' => 'id']],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'category_id' => 'Category ID',
            'language' => 'Language',
            'name' => 'Название',
        ];
    }

    public function formName()
    {
        return 'CategoriesProduct_'.$this->language;
    }


    /**
     * @return \yii\db\ActiveQuery
     */
    public function getCategory()
    {
        return $this->hasOne(ProductsCategory::className(), ['id' => 'category_id']);
    }
}
