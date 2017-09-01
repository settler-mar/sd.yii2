<?php

namespace frontend\models;

use yii;
use frontend\modules\cache\models\Cache;

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

//    /**
//     * @param bool $insert
//     * @param array $changedAttributes
//     * обновляем зависимость кеш
//     */
//    public function afterSave($insert, $changedAttributes)
//    {
//        Cache::clearName('route_changes');
//    }
//
//    /**
//     * обновляем зависимость кеш
//     */
//    public function afterDelete()
//    {
//        Cache::clearName('route_changes');
//    }
    /**
     * @param $route
     * @param int $routeType
     * @param bool $recurce - не останавливаемся, пока есть новый роуд для уже найденных роутов
     * @return string
     * находим по роуту и по типу, закешировано, возвращаем новый роут
     */
    public static function getNew($route, $routeType = 0, $recurse = false)
    {
        $result = null;
        do {
            $newRoute =  self::findOne(['route' => $route, 'route_type' => $routeType]);
            if ($newRoute) {
                $route = $result = $newRoute->new_route;
            }
            if (!$recurse) {//если $recurse - бесконечный цикл, пока не найдётся последний
                break;
            }
        } while ($newRoute);
        return $result;
    }

}
