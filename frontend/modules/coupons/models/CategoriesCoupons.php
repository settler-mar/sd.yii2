<?php

namespace frontend\modules\coupons\models;

use yii;
use frontend\modules\stores\models\Stores;
use frontend\modules\stores\models\CategoriesStores;
use frontend\modules\cache\models\Cache;
use common\components\Help;


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
            [['name', 'route'], 'trim'],
            [['short_description', 'short_description_offline'], 'string'],
            [['short_description', 'short_description_offline'], 'trim'],
            [['description'], 'string'],
            [['description'], 'trim'],
            [['name', 'route'], 'string', 'max' => 255],
            [['route'], 'unique'],
            [['route'], 'unique', 'targetAttribute' =>'route', 'targetClass' => Stores::className()],
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
            'short_description' => 'Нижнее описание',
            'short_description_offline' => 'Нижнее описание оффлайн',
            'route' => 'Route',
            'description' => 'Верхнее описание',
        ];
    }

    public function beforeValidate()
    {
        if (!parent::beforeValidate()) {
            return false;
        }

        if (empty($this->route)) {
            $help = new Help();
            $this->route = $help->str2url($this->name);
        }
        return true;
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

    public function getStoresCategories()
    {
        return $this->hasMany(CategoriesStores::className(), ['uid' => 'store_category_id'])
            ->viaTable('cw_stores_category_to_coupons_category', ['coupon_category_id' => 'uid']);
    }

    /**
     * @param null $id
     * очистка кеш
     */
    public static function clearCache($id = null, $route = null)
    {
        //зависимости
        Cache::clearName('catalog_coupons');

        //ключи
        Cache::deleteName('total_all_coupons');
        Cache::deleteName('total_all_coupons_expired');
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
