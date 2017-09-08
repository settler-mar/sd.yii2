<?php

namespace frontend\modules\stores\models;

use yii;
use frontend\modules\stores\models\CategoriesStores;
use frontend\modules\coupons\models\CategoriesCoupons;
use frontend\modules\coupons\models\Coupons;
use frontend\modules\reviews\models\Reviews;
use yii\helpers\FileHelper;
use yii\web\UploadedFile;
use JBZoo\Image\Image;
use frontend\modules\cache\models\Cache;
use frontend\models\RouteChange;
use frontend\models\DeletedPages;
use common\components\Help;

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
  public $logoImage;

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
      [['name', 'route', 'url', 'currency', 'added', 'hold_time'], 'required'],
      [['alias', 'description', 'conditions', 'short_description', 'contact_name', 'contact_phone', 'contact_email'], 'string'],
      [['added'], 'safe'],
      [['visit', 'hold_time', 'is_active', 'active_cpa', 'percent', 'action_id'], 'integer'],
      [['name', 'route', 'url', 'logo', 'local_name'], 'string', 'max' => 255],
      [['currency'], 'string', 'max' => 3],
      [['displayed_cashback'], 'string', 'max' => 30],
      [['route'], 'unique'],
      [['route'], 'unique', 'targetAttribute' =>'route', 'targetClass' => CategoriesStores::className()],
      [['route'], 'unique', 'targetAttribute' =>'route', 'targetClass' => CategoriesCoupons::className()],
      ['!logoImage', 'file', 'extensions' => 'jpeg', 'on' => ['insert', 'update']],
      [['logoImage'], 'image',
        'minHeight' => 60,
        'minWidth' => 145,
        'maxSize' => 2 * 1024 * 1024,
        'skipOnEmpty' => true
      ],
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
      'visit' => 'Посщения',
      'hold_time' => 'Hold Time',
      'is_active' => 'Активен',
      'short_description' => 'Short Description',
      'local_name' => 'Альтернативное название',
      'active_cpa' => 'Active Cpa',
      'percent' => 'Percent',
      'action_id' => 'Action ID',
      'contact_name' => 'Contact Name',
      'contact_phone' => 'Contact Phone',
      'contact_email' => 'Contact Email',
      'category_cnt'=>'Количество категорий',
      'action_id'=>'Акция',
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
    if (empty($this->route)) {
      $help = new Help();
      $this->route = $help->str2url($this->name);
    }

    return true;
  }
  /**
   * категории магазина
   * @return $this
   */
  public function getCategories()
  {
    return $this->hasMany(CategoriesStores::className(), ['uid' => 'category_id'])
      ->viaTable('cw_stores_to_categories', ['store_id' => 'uid']);
  }

  public function getCategory_cnt(){
    return StoresToCategories::find()->where(['store_id'=>$this->uid])->count();
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
  public function getCpaLink()
  {
    return $this->hasOne(CpaLink::className(), ['id' => 'active_cpa']);
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
        ->where(['is_active' => [0, 1]])
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
        ->where([
          'route' => $route,
          //'is_active' => [0, 1]
        ])
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
   * @param bool $insert
   * @return bool
   * если изменился route - пишем в таблицу изменённых роутов
   */
  public function beforeSave($insert)
  {
    if (!parent::beforeSave($insert)) {
      return false;
    }
    if ($insert) {
      return true;
    }
    $oldRoute =  $this->__get('oldAttributes')['route'];

    if (!$this->isNewRecord && $oldRoute != $this->route) {
      $routeChange = new RouteChange();
      $routeChange->route = $oldRoute;
      $routeChange->new_route = $this->route;
      $routeChange->route_type = RouteChange::ROUTE_TYPE_STORES;
      $routeChange->save();
    }
    return true;
  }
  /**
   * @param bool $insert
   * @param array $changedAttributes
   * Сохраняем изображения после сохранения
   * данных пользователя
   * очищаем кеш, связанный с магазинами и данным store
   */
  public function afterSave($insert, $changedAttributes)
  {
    $this->saveImage();
    $this->clearCache($this->uid, $this->route);
  }

  /**
   * очищаем кеш, связанный с магазинами и данным store
   * пишем записи в удалённые страницы
   */
  public function afterDelete()
  {
    $this->clearCache($this->uid, $this->route);

    $deletedPage = new DeletedPages();
    $deletedPage->page = '/stores/'.$this->route;
    $deletedPage->new_page = '/stores';
    $deletedPage->save();
    $deletedPage = new DeletedPages();
    $deletedPage->page = '/coupons/'.$this->route;
    $deletedPage->new_page = '/coupons';
    $deletedPage->save();
  }
  /**
   * Сохранение изображения (аватара)
   * пользвоателя
   */
  public function saveImage()
  {
    $photo = \yii\web\UploadedFile::getInstance($this, 'logoImage');
    if ($photo) {
      $path = $this->getStorePath();// Путь для сохранения
      $oldImage = $this->logo;
      $name = time(); // Название файла
      $exch = explode('.', $photo->name);
      $exch = $exch[count($exch) - 1];
      $name .= '.' . $exch;
      $this->logo = $name;   // Путь файла и название
      $bp=Yii::$app->getBasePath().'\web'.$path;
      if (!file_exists($bp.$path)) {
        mkdir($bp.$path, 0777, true);   // Создаем директорию при отсутствии
      }
      $img = (new Image($photo->tempName));
      $img
        ->fitToWidth(500)
        ->saveAs($bp.$this->logo);
      if ($img) {
        $this->removeImage($bp.$oldImage);   // удаляем старое изображение
        $this::getDb()
          ->createCommand()
          ->update($this->tableName(), ['logo' => $this->logo], ['uid' => $this->uid])
          ->execute();
      }
    }
  }

  /**
   * Удаляем изображение при его наличии
   */
  public function removeImage($img)
  {
    if ($img) {
      // Если файл существует
      if (is_readable($img) && is_file($img)) {
        // ddd($img);
        unlink($img);
      }
    }
  }

  public function getStorePath()
  {
    $path = '/images/logos/';
    return $path;
  }

  /**
   * @param $id
   * @param $route
   * очистка кеша или зависимостей кеша, связанных с магазинами или конкретным магазином
   */
  private function clearCache($id = null, $route = null)
  {
    //зависимости
    Cache::clearName('catalog_stores');
    Cache::clearName('additional_stores');
    Cache::clearName('category_tree');
    Cache::clearName('coupons_counts');
    //ключи
    Cache::deleteName('total_all_stores');
    Cache::deleteName('top_12_stores');
    Cache::deleteName('categories_stores');
    if ($id) {
      Cache::deleteName('store_byid_' . $id);
    }
    if ($route) {
      Cache::deleteName('store_by_route_' . $route);
    }
    Cache::deleteName('stores_coupons');
  }
  
}
