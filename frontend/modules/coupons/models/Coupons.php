<?php

namespace frontend\modules\coupons\models;

use Yii;
use frontend\modules\stores\models\Stores;
use frontend\modules\coupons\models\CategoriesCoupons;

/**
 * This is the model class for table "cw_coupons".
 *
 * @property integer $uid
 * @property integer $coupon_id
 * @property string $name
 * @property string $image
 * @property string $description
 * @property string $date_start
 * @property string $date_end
 * @property string $goto_link
 * @property string $promocode
 * @property integer $exclusive
 * @property integer $species
 * @property integer $visit
 * @property integer $store_id
 */
class Coupons extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cw_coupons';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['coupon_id', 'name', 'image', 'description', 'date_start', 'date_end', 'goto_link', 'promocode', 'exclusive', 'species', 'visit'], 'required'],
            [['coupon_id', 'exclusive', 'species', 'visit', 'store_id'], 'integer'],
            [['description'], 'string'],
            [['date_start', 'date_end'], 'safe'],
            [['name', 'image', 'goto_link', 'promocode'], 'string', 'max' => 255],
            [['coupon_id'], 'unique'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'uid' => 'Uid',
            'coupon_id' => 'Coupon ID',
            'name' => 'Name',
            'image' => 'Image',
            'description' => 'Description',
            'date_start' => 'Date Start',
            'date_end' => 'Date End',
            'goto_link' => 'Goto Link',
            'promocode' => 'Promocode',
            'exclusive' => 'Exclusive',
            'species' => 'Species',
            'visit' => 'Visit',
            'store_id' => 'Store ID',
        ];
    }

    /**
     * магазин купона
     * @return \yii\db\ActiveQuery
     */
    public function getStore()
    {
        return $this->hasOne(Stores::className(), ['uid' => 'store_id']);
    }

    /**
     * Категории купона
     * @return $this
     */
    public function getCategories()
    {
        return $this->hasMany(CategoriesCoupons::className(), ['uid' => 'category_id'])
            ->viaTable('cw_coupons_to_categories', ['coupon_id' => 'coupon_id']);
    }
}
