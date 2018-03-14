<?php

namespace frontend\modules\stores\models;

/**
 * Class StoresCategoriesToCouponsCategories
 * @package frontend\modules\stores\models
 */
class StoresCategoriesToCouponsCategories extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cw_stores_category_to_coupons_category';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['store_category_id', 'coupon_category_id'], 'required'],
            [['store_category_id', 'coupon_category_id'], 'integer'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'store_category_id' => 'Категория шопа',
            'coupon_category_id' => 'Категория купона',
        ];
    }

}
