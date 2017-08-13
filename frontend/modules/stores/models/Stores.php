<?php

namespace frontend\modules\stores\models;

use Yii;
use frontend\modules\category_stores\models\CategoryStores;
use frontend\modules\coupons\models\Coupons;
use yii\helpers\FileHelper;
use yii\web\UploadedFile;



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
  public $string;
  public $filename;
  public $logoTmp;
  public $qqq;

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
            [['name', 'route', 'alias', 'url', 'description', 'currency', 'displayed_cashback', 'conditions', 'hold_time'], 'required'],
            [['alias', 'description', 'conditions', 'short_description', 'contact_name', 'contact_phone', 'contact_email'], 'string'],
          [['added'], 'safe'],
         // [['logo'], 'file'],
          [['visit', 'hold_time', 'is_active', 'active_cpa', 'percent', 'action_id'], 'integer'],
          [['name', 'route', 'url', 'local_name'], 'string', 'max' => 255],
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
     * @return mixed
     */
    public static function activeCount()
    {
        $cache = Yii::$app->cache;
        $data = $cache->getOrSet('total_all_stores', function () {
            return self::find()
                ->where(['not in', 'is_active', [-1]])
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

  public function beforeSave($insert){
    $this->string = substr(uniqid('img'),0,12);
    $this->logoTmp = UploadedFile::getInstance($this, 'qqq');
    if ($this->logoTmp!=null) {

      FileHelper::createDirectory('images/logo/');

      $this->filename = 'images/logo/' . $this->string . '.' . $this->logoTmp->extension;

      if ($this->logo!= null){ $this->logoTmp->saveAs($this->logo); }
      else
      {
        $this->logoTmp->saveAs($this->filename);
        $this->logo = $this->filename;
      }
    }
    return parent::beforeSave($insert); // TODO: Change the autogenerated stub
  }
}
