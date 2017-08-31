<?php

namespace frontend\modules\coupons\models;

use yii;
use frontend\modules\stores\models\Stores;
use frontend\modules\category_stores\models\CategoryStores;
use frontend\modules\cache\models\Cache;


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
            [['name', 'route'], 'required'],
            [['short_description'], 'string'],
            [['name', 'route'], 'string', 'max' => 255],
            [['route'], 'unique'],
            [['route'], 'unique', 'targetAttribute' =>'route', 'targetClass' => Stores::className()],
            //[['route'], 'unique', 'targetAttribute' =>'route', 'targetClass' => CategoryStores::className()],
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
            'route' => 'Route',
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

    public static function byRoute($route)
    {
        $cache = \Yii::$app->cache;
        $category = $cache->getOrSet('categories_coupons_byroute_' . $route, function () use ($route) {
            return self::findOne(['route' => $route]);
        });
        return $category;
    }

    public function afterSave($insert, $changedAttributes)
    {
        self::clearCache($this->uid, $this->route);
    }
    
    public function afterDelete()
    {
        self::clearCache($this->uid, $this->route);
    }

    /**
     * @param null $id
     * очистка кеш
     */
    public static function clearCache($id = null, $route = null)
    {
        //зависимости
        Cache::clearName('catalog_coupons');
        Cache::clearName('catalog_coupons_count');

        //ключи
        Cache::deleteName('total_all_coupons');
        Cache::deleteName('stores_coupons');
        Cache::deleteName('categories_coupons');
        if ($id) {
            Cache::deleteName('categories_coupons_byid_' . $id);
        }
        if ($route) {
            Cache::deleteName('categories_coupons_byroute_' . $route);
        }
    }



}
