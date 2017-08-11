<?php

namespace frontend\modules\stores\models;

use Yii;
use frontend\modules\category_stores\models\CategoryStores;
use frontend\modules\coupons\models\Coupons;
use frontend\modules\reviews\models\Reviews;




/**
 * This is the model class for table "cw_stores".
 *
 * @property integer $uid
 * @property string $name
 * @property string $route
 * @property string $alias
 * @property string $url
 * @property string $logo
 * @property string $description
 * @property string $currency
 * @property string $displayed_cashback
 * @property string $conditions
 * @property string $added
 * @property integer $visit
 * @property integer $hold_time
 * @property integer $is_active
 * @property string $short_description
 * @property string $local_name
 * @property integer $active_cpa
 * @property integer $percent
 */
class Stores extends \yii\db\ActiveRecord
{

    /**
     * @var string
     */
    public static $defaultSort = 'name';
    /**
     * Possible sorting options with titles and default value
     * @var array
     */
    public static $sortvars = [
        'visit' => ["title" => "Популярности", "title_mobile" => "По популярности"],
        'name' => ["title" => "Алфавиту", "title_mobile" => "По алфавиту", 'order' => 'ASC'],
        'added' => ["title" => "Новизне", "title_mobile" => "По новизне"],
        'cashback_percent' => ["title" => "%", "title_mobile" => "По % кэшбэка"],
        'cashback_summ' => ["title" => "$", "title_mobile" => "По $ кэшбэка"],
    ];
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cw_stores';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['name', 'route', 'alias', 'url', 'logo', 'description', 'currency', 'displayed_cashback', 'conditions', 'added', 'visit', 'hold_time'], 'required'],
            [['alias', 'description', 'conditions', 'short_description', 'contact_name', 'contact_phone', 'contact_email'], 'string'],
            [['added'], 'safe'],
            [['visit', 'hold_time', 'is_active', 'active_cpa', 'percent', 'action_id'], 'integer'],
            [['name', 'route', 'url', 'logo', 'local_name'], 'string', 'max' => 255],
            [['currency'], 'string', 'max' => 3],
            [['displayed_cashback'], 'string', 'max' => 30],
            [['route'], 'unique'],
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
            'route' => 'Route',
            'alias' => 'Alias',
            'url' => 'Url',
            'logo' => 'Logo',
            'description' => 'Description',
            'currency' => 'Currency',
            'displayed_cashback' => 'Displayed Cashback',
            'conditions' => 'Conditions',
            'added' => 'Added',
            'visit' => 'Visit',
            'hold_time' => 'Hold Time',
            'is_active' => 'Is Active',
            'short_description' => 'Short Description',
            'local_name' => 'Local Name',
            'active_cpa' => 'Active Cpa',
            'percent' => 'Percent',
            'action_id' => 'Action ID',
            'contact_name' => 'Contact Name',
            'contact_phone' => 'Contact Phone',
            'contact_email' => 'Contact Email',
        ];
    }

    /**
     * категории магазина
     * @return $this
     */
    public function getCategories()
    {
        return $this->hasMany(CategoryStores::className(), ['uid' => 'category_id'])
            ->viaTable('cw_stores_to_categories', ['store_id' => 'uid']);
    }
    /**
     * promo stores
     * @return $this
     */
    public function getPromoStores()
    {
        return $this->hasMany(PromoStores::className(), ['store_id' => 'uid']);
    }
    /**
     * coupons
     * @return $this
     */
    public function getCoupons()
    {
        return $this->hasMany(Coupons::className(), ['store_id' => 'uid']);
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getSpaLink()
    {
        return $this->hasOne(SpaLink::className(), ['id' => 'active_cpa']);
    }

    /**
     * @return mixed
     */
    public static function activeCount()
    {
        $cache = Yii::$app->cache;
        $data = $cache->getOrSet('total_all_stores', function () {
            return self::find()
                ->where(['is_active' => [0, 1]])
                ->count();
        });
        return $data;
    }

    /**
     * @return mixed
     */
    public static function top12()
    {
        $cache = Yii::$app->cache;
        $data = $cache->getOrSet('top_12_stores', function () {
            return self::find()
                ->orderBy('visit DESC')
                ->limit(12)
                ->all();
        });
        return $data;
    }

    /**
     * @param $route
     * @return mixed
     */
    public static function byRoute($route)
    {
        $cache = Yii::$app->cache;
        $data = $cache->getOrSet('store_by_route_' . $route, function () use ($route) {
            return self::find()
                ->where(['route' => $route])
                ->one();
        });
        return $data;
    }

    /**
     * @param $id
     * @return mixed
     */
    public static function byId($id)
    {
        $cache = Yii::$app->cache;
        $data = $cache->getOrSet('store_byid_' . $id, function () use ($id) {
            return self::findOne($id);
        });
        return $data;
    }
  
}
