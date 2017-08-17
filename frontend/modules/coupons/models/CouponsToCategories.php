<?php

namespace frontend\modules\coupons\models;

use Yii;

/**
 * This is the model class for table "cw_coupons_to_categories".
 *
 * @property integer $uid
 * @property integer $category_id
 * @property integer $coupon_id
 */
class CouponsToCategories extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cw_coupons_to_categories';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['category_id', 'coupon_id'], 'required'],
            [['category_id', 'coupon_id'], 'integer'],
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
            'coupon_id' => 'Coupon ID',
        ];
    }
}
