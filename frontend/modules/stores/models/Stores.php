<?php

namespace frontend\modules\stores\models;

use yii;
use frontend\modules\stores\models\CategoriesStores;
use frontend\modules\coupons\models\CategoriesCoupons;
use frontend\modules\coupons\models\Coupons;
use frontend\modules\reviews\models\Reviews;
use b2b\modules\stores_points\models\B2bStoresPoints;
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
  public $image_url;
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
      [['name', 'route', 'url', 'currency', 'added', 'hold_time','percent'], 'required'],
      [['alias', 'description', 'conditions', 'short_description', 'contact_name', 'contact_phone', 'contact_email','video'], 'string'],
      [['added'], 'safe'],
      [['visit', 'hold_time', 'is_active', 'active_cpa', 'percent', 'action_id', 'is_offline', 'related'], 'integer'],
      [['name', 'route', 'url', 'logo', 'local_name'], 'string', 'max' => 255],
      [['currency'], 'string', 'max' => 3],
      [['displayed_cashback'], 'string', 'max' => 30],
      [['route'], 'unique', 'targetAttribute' =>['route','is_offline']],
      [['route'], 'unique', 'targetAttribute' =>'route', 'targetClass' => CategoriesStores::className()],
      [['route'], 'unique', 'targetAttribute' =>'route', 'targetClass' => CategoriesCoupons::className()],
      [['related'], 'compare', 'compareAttribute' => 'uid', 'operator' => '!='],
      [['related'], 'exist', 'targetAttribute' => 'uid'],
      ['!logoImage', 'file', 'extensions' => 'jpeg', 'on' => ['insert', 'update']],
      [['logoImage'], 'image',
        'minHeight' => 59,
        'minWidth' => 143,
        'maxHeight' => 59,
        'maxWidth' => 143,
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
      'action_id' => 'Акция',
      'contact_name' => 'Contact Name',
      'contact_phone' => 'Contact Phone',
      'contact_email' => 'Contact Email',
      'category_cnt'=>'Количество категорий',
      'related' => 'Связанный магазин',
      'is_offline' => 'Тип магазина',
      'video' => 'Видео для слайдера (ссылка на YouTube или Vimeo)',
    ];
  }

  public function beforeValidate()
  {
    if ($this->isNewRecord) {
      $this->added = date('Y-m-d H:i:s');
    }
    if (empty($this->route)) {
      $help = new Help();
      $this->route = $help->str2url($this->name);
    }

    $this->video = json_encode($this->video);
    return parent::beforeValidate();
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

  public function getRelatedData(){
    return $this->hasOne(Stores::className(),['uid'=>'related']);
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
   * @return yii\db\ActiveQuery
   */
  public function getStoresPoints()
  {
    return $this->hasMany(B2bStoresPoints::className(), ['store_id' => 'uid']);
  }

  public function afterFind()
  {
    $this->video = json_decode($this->video, true);
    /*$str=$this->video[0];
    $str=explode('?',$str);
    d($str);
    parse_str($str[1],$data);
    ddd($data);*/
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

  public function getRouteUrl(){
    $url=$this->route;
    if($this->is_offline==1){
      $url.='-offline';
    }
    return $url;
  }
  /**
   * @param $route
   * @return mixed
   */
  public static function byRoute($route)
  {
    $where = array();
    if(strpos($route,'-offline')){
      $where['is_offline']=1;
      $where['route']=str_replace('-offline','',$route);
    }else{
      $where['is_offline']=0;
      $where['route']=$route;
    }
    $cache = Yii::$app->cache;
    $data = $cache->getOrSet('store_by_route_' . $route, function () use ($where) {
      return self::find()
        ->where($where)
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

    //удаляем купоны
    $coupons = Coupons::find()
      ->where(['store_id' => $this->uid])
      ->all();
    foreach ($coupons as $coupon){
      $coupon->delete();
    }

    //удаляем отзывы
    $reviews = Reviews::find()
      ->where(['store_id' => $this->uid])
      ->all();
    foreach ($reviews as $review){
      $review->delete();
    }

    $path = $this->getStorePath();// Путь для сохранения
    $bp=Yii::$app->getBasePath().'/web'.$path;
    $this->removeImage($bp.$this->logo);   // удаляем старое изображение

    $this->clearPhotos(); //чистим фотки магазина
    B2bStoresPoints::deleteAll(['store_id'=>$this->uid]);//удаление торговых точек
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
      $bp=Yii::$app->getBasePath().'/web'.$path;
      if (!file_exists($bp)) {
        mkdir($bp.$path, 0777, true);   // Создаем директорию при отсутствии
      }
      $img = (new Image($photo->tempName));
      $img
        ->fitToWidth(143)
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

  public function getPhotoList(){
    $path = $this->getStorePhotoPath();
    $bp=Yii::$app->getBasePath().'/web'.$path;
    if(!is_readable($bp)){
      return array();
    }
    $list=array_diff(scandir($bp), array('..', '.'));
    foreach ($list as &$item){
      $item=$path.$item;
    }
    return $list;
  }

  public function clearPhotos(){
    $path = $this->getStorePhotoPath();
    $bp=Yii::$app->getBasePath().'/web'.$path;
    if(!is_readable($bp)){
      return true;
    }
    $list=array_diff(scandir($bp), array('..', '.'));
    foreach ($list as $item){
      unlink($bp.$item);
    }
    rmdir($bp);
    return true;
  }

  public function addPhoto($photo,$index=0){
    if ($photo) {
      $index=($index==0?'':'-'.$index);
      $path = $this->getStorePhotoPath();// Путь для сохранения
      $name = time().$index; // Название файла
      $exch = explode('.', $photo->name);
      $exch = $exch[count($exch) - 1];
      $name .= '.' . $exch;
      $bp=Yii::$app->getBasePath().'/web'.$path;
      if (!file_exists($bp)) {
        mkdir($bp, 0777, true);   // Создаем директорию при отсутствии
      }
      $img = (new Image($photo->tempName));
      $img
        ->fitToWidth(1000)
        ->saveAs($bp.$name);
      if(!$img){
        return ['error' => 'Ошибка сохранения файла'];
      }
      return ['name' => $path.$name];
    }else{
      return ['error' => 'Ошибка сохранения файла'];
    }
  }

  public function removePhoto($path){
    $bp=Yii::$app->getBasePath().'/web'.$path;
    if (!file_exists($bp)) {
      return 'err';
    }
    unlink($bp);
    return true;
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

  public function getStorePhotoPath()
  {
    $dir=($this->uid % 100);
    $path = '/images/photos/'.(($this->uid-$dir)/100).'/'.($dir).'/';
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
