<?php

namespace frontend\modules\stores\models;

use Yii;

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
}
