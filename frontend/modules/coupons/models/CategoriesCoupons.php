<?php

namespace frontend\modules\coupons\models;

use Yii;
use frontend\modules\stores\models\Stores;


/**
 * This is the model class for table "cw_categories_coupons".
 *
 * @property integer $uid
 * @property string $name
 * @property string $short_description
 */
class CategoriesCoupons extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cw_categories_coupons';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['name'], 'required'],
            [['short_description'], 'string'],
            [['name'], 'string', 'max' => 255],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'uid' => 'Uid',
            'name' => 'Name',
            'short_description' => 'Short Description',
        ];
    }
    /**
     * купоны категории
     * @return $this
     */
    public function getCoupons()
    {
        return $this->hasMany(Coupons::className(), ['coupon_id' => 'coupon_id'])
            ->viaTable('cw_coupons_to_categories', ['category_id' => 'uid']);
    }

    /**
     * то же что findOne но закешировано
     * @param $categoryId
     * @return mixed
     */
    public static function byId($categoryId)
    {
        $cache = \Yii::$app->cache;
        $category = $cache->getOrSet('categories_coupons_byid_' . $categoryId, function () use ($categoryId) {
            return self::findOne($categoryId);
        });
        return $category;
    }



}
