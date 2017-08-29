<?php

namespace frontend\modules\stores\models;

use yii;
use frontend\modules\category_stores\models\CategoryStores;
/**
 * This is the model class for table "cw_stores_to_categories".
 *
 * @property integer $uid
 * @property integer $category_id
 * @property integer $store_id
 */
class StoresToCategories extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cw_stores_to_categories';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['category_id'], 'required'],
            [['category_id', 'store_id'], 'integer'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'uid' => 'Uid',
            'category_id' => 'Category ID',
            'store_id' => 'Store ID',
        ];
    }

    /**
     * @return yii\db\ActiveQuery
     */
    public function getCategories()
    {
        return $this->hasMany(CategoryStores::className(), ['uid' => 'category_id']);
    }

    /**
     * @param bool $insert
     * @param array $changedAttributes
     * при изменении - очистить кеш категории магазинов
     */
    public function afterSave($insert, $changedAttributes)
    {
        CategoryStores::clearCache();
    }

    /**
     * очистить кеш категорий магазинов
     */
    public function afterDelete()
    {
        CategoryStores::clearCache();
    }
}
