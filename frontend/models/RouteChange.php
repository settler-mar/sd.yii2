<?php

namespace frontend\models;

use Yii;

/**
 * This is the model class for table "cw_route_change".
 *
 * @property integer $uid
 * @property integer $route_type
 * @property string $route
 * @property string $new_route
 */
class RouteChange extends \yii\db\ActiveRecord
{
    const ROUTE_TYPE_STORES = 0;
    const ROUTE_TYPE_CATEGORY_STORES = 1;
    const ROUTE_TYPE_CATEGORY_COUPONS = 2;
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cw_route_change';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['route_type'], 'integer'],
            [['route', 'new_route'], 'required'],
            [['route', 'new_route'], 'string', 'max' => 255],
            [['route'], 'unique'],
            [['new_route'], 'unique'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'uid' => 'Uid',
            'route_type' => 'Route Type',
            'route' => 'Route',
            'new_route' => 'New Route',
        ];
    }
}
