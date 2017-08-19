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
      [['name', 'route', 'url', 'currency', 'logo', 'added', 'hold_time'], 'required'],
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

  public function beforeValidate()
  {
    if (!parent::beforeValidate()) {
      return false;
    }

    if ($this->isNewRecord) {
      $this->added = date('Y-m-d H:i:s');
    }

    return true;
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

  /**
   * Newline in translit
   * @param string $string
   * @return string
   */
  private static function rus2translit($string)
  {
    $converter = [
      'а' => 'a', 'б' => 'b', 'в' => 'v',
      'г' => 'g', 'д' => 'd', 'е' => 'e',
      'ё' => 'e', 'ж' => 'zh', 'з' => 'z',
      'и' => 'i', 'й' => 'y', 'к' => 'k',
      'л' => 'l', 'м' => 'm', 'н' => 'n',
      'о' => 'o', 'п' => 'p', 'р' => 'r',
      'с' => 's', 'т' => 't', 'у' => 'u',
      'ф' => 'f', 'х' => 'h', 'ц' => 'c',
      'ч' => 'ch', 'ш' => 'sh', 'щ' => 'sch',
      'ь' => '', 'ы' => 'y', 'ъ' => '',
      'э' => 'e', 'ю' => 'yu', 'я' => 'ya',
      'А' => 'A', 'Б' => 'B', 'В' => 'V',
      'Г' => 'G', 'Д' => 'D', 'Е' => 'E',
      'Ё' => 'E', 'Ж' => 'Zh', 'З' => 'Z',
      'И' => 'I', 'Й' => 'Y', 'К' => 'K',
      'Л' => 'L', 'М' => 'M', 'Н' => 'N',
      'О' => 'O', 'П' => 'P', 'Р' => 'R',
      'С' => 'S', 'Т' => 'T', 'У' => 'U',
      'Ф' => 'F', 'Х' => 'H', 'Ц' => 'C',
      'Ч' => 'Ch', 'Ш' => 'Sh', 'Щ' => 'Sch',
      'Ь' => '', 'Ы' => 'Y', 'Ъ' => '',
      'Э' => 'E', 'Ю' => 'Yu', 'Я' => 'Ya',
    ];
    return strtr($string, $converter);
  }

  /**
   * Newline in the url like
   * @param string $str
   * @return string
   */
  public static function str2url($str)
  {
    $str = self::rus2translit($str);
    $str = strtolower($str);
    $str = preg_replace('~[^-a-z0-9_]+~u', '-', $str);
    $str = trim($str, "-");
    return $str;
  }
}
