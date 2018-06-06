<?php

namespace frontend\modules\stores\models;

use frontend\modules\ar_log\behaviors\ActiveRecordChangeLogBehavior;
use yii;
use frontend\modules\stores\models\CategoriesStores;
use frontend\modules\coupons\models\CategoriesCoupons;
use frontend\modules\coupons\models\Coupons;
use frontend\modules\reviews\models\Reviews;
use frontend\modules\favorites\models\UsersFavorites;
use frontend\modules\users\models\Users;
use b2b\modules\stores_points\models\B2bStoresPoints;
use yii\helpers\FileHelper;
use yii\web\UploadedFile;
use JBZoo\Image\Image;
use common\components\SdImage;
use frontend\modules\cache\models\Cache;
use frontend\models\RouteChange;
use frontend\models\DeletedPages;
use common\components\Help;
use yii\db\Query;
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
  public $videos;
  public $regions;
  public $regions_list;

  public static $translated_attributes = ['description', 'conditions', 'short_description', 'local_name',
      'contact_name', 'contact_phone', 'contact_email', 'coupon_description',
  ];

  public function behaviors()
  {
    return [
        [
            'class' => ActiveRecordChangeLogBehavior::className(),
            'ignoreAttributes' => ['visit'],
        ],
    ];
  }


  /**
   * @var array
   */
  protected static $defaultSorts = ['region_rating', 'visit'];
  /**
   * Possible sorting options with titles and default value
   * @var array
   */
//  public static $sortvars = [
//    'rating' => ["title" => "Популярности", "title_mobile" => "Популярности", 'no_online' => 1],
//    'visit' => ["title" => "Популярности", "title_mobile" => "Популярности" , 'no_offline' => 1],
//    'name' => ["title" => "Алфавиту", "title_mobile" => "Алфавиту", 'order' => 'ASC'],
//    'added' => ["title" => "Новизне", "title_mobile" => "Новизне"],
//    'cashback_percent' => ["title" => "%", "title_mobile" => "% кэшбэка"],
//    'cashback_summ' => ["title" => "$", "title_mobile" => "$ кэшбэка"],
//  ];

  public static function sortvars(){
      return [
          'region_rating' => [
              "title" => Yii::t('main','sort_by_rating'),
              "title_mobile" => Yii::t('main','sort_by_rating_mobile'),
              'no_online' => 1
          ],
          'visit' => [
              "title" => Yii::t('main','sort_by_rating'),
              "title_mobile" => Yii::t('main','sort_by_rating_mobile'),
              'no_offline' => 1
          ],
          'name' => [
              "title" => Yii::t('main','sort_by_abc'),
              "title_mobile" => Yii::t('main','sort_by_abc_mobile'),
              'order' => 'ASC'
          ],
          'added' => [
              "title" => Yii::t('main','sort_by_date'),
              "title_mobile" => Yii::t('main','sort_by_date_mobile')
          ],
          'cashback_percent' => [
              "title" => Yii::t('main','sort_by_percent'),
              "title_mobile" => Yii::t('main','sort_by_percent_mobile')
          ],
          'cashback_summ' => [
              "title" => Yii::t('main','sort_by_cashback'),
              "title_mobile" => Yii::t('main','sort_by_cashback_mobile')
          ],
      ];
  }

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
      [['name', 'route', 'currency', 'added', 'hold_time','percent'], 'required'],
      [['name', 'route', 'currency', 'added', 'hold_time','percent'], 'trim'],
      [['alias', 'description', 'conditions', 'short_description', 'contact_name', 'contact_phone',
          'contact_email','video','network_name','coupon_description', 'region'], 'string'],
      [['alias', 'description', 'conditions', 'short_description', 'contact_name',
          'contact_phone', 'contact_email','video','network_name','coupon_description', 'region'], 'trim'],
      [['added'], 'safe'],
      [['visit', 'hold_time', 'is_active', 'active_cpa', 'percent', 'action_id', 'is_offline', 'related',
          'cash_number', 'show_notify','show_tracking', 'watch_transitions'], 'integer'],
      [['name', 'route', 'url','url_alternative', 'logo', 'local_name', 'related_stores'], 'string', 'max' => 255],
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
      [['videos', 'regions'], 'safe'],
      ['regions_list', 'in', 'allowArray' => true, 'range' => array_keys(Yii::$app->params['regions_list'])]

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
      'url_alternative' => 'Дополнительные URL(через запятую)',
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
      'related' => 'Связанный магазин(ID, связка онлайн-оффлайн)',
      'is_offline' => 'Тип магазина',
      'video' => 'Видео для слайдера (ссылка на YouTube или Vimeo)',
      'videos' => 'Видео для слайдера (ссылка на YouTube или Vimeo)',
      //'rating' => 'Рейтинг',
      //'no_rating_calculate' => 'Не пересчитывать рейтинг',
      'cash_number' => 'Номер чека',
      'related_stores' => 'Магазины торговой сети (ID через запятую)',
      'network_name' => 'Название торговой сети',
      'show_notify' => 'Отображать в задолбашках',
      'coupon_description' => 'Текст для активных купонов',
      'region' => 'Регионы',
      'watch_transitions' => 'Отслеживать переходы',
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

    $this->video = json_encode($this->videos);
    $this->region = $this->regions_list ? implode(',', $this->regions_list) : null;
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

    /**
     * рейтинг по регионам
     * @return yii\db\ActiveQuery
     */
  public function getRatings(){
    return $this->hasMany(StoreRatings::className(), ['store_id' => 'uid']);
  }

  /*
   * Выдает магазины сети автоматом добавдяя связанный онлайн-оффлайн магазин и удаляется текущий
   *
   */
  public function getRelatedStores()
  {
    if (empty($this->related_stores)) {
      return null;
    }
    $ids = explode(',', $this->related_stores);
    $ids[]=$this->related;

    foreach(array_keys($ids,$this->uid) as $key){
      unset($ids[$key]);
    }

    $stores = self::find()
      ->where(['is_active' => [0, 1], 'uid' => $ids])
      ->asArray()
      ->all();

    return ($stores);
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
    if(strlen($this->video)<10) {
      //$this->video = array();
      $this->videos = [];
    } else {
      $this->videos = json_decode($this->video, true);
      foreach ($this->videos as &$videoItem) {
          if (is_string($videoItem)) {
              $videoItem =  [
                  'video' => $videoItem,
                  'title' => ''
              ];
          }
      }
      //$this->video = json_decode($this->video, true);
    }
    $regions = explode( ',', $this->region);
    foreach (Yii::$app->params['regions_list'] as $key => $region) {
        $this->regions[] = [
            'name' => $region['name'],
            'code' => $key,
            'checked' => in_array($key, $regions)
        ];
    }
  }

  /**
   * @return mixed
   */
  public static function activeCount($filters = [])
  {
    $cache = Yii::$app->cache;
    $cache_name = 'total_all_stores';
    $dependency = new yii\caching\DbDependency;
    $dependencyName = 'total_all_stores';
    $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $dependencyName . '"';

    foreach ($filters as $key => $filter) {
        $cache_name .= '_'.$key.'_'.$filter;
    }
    $data = $cache->getOrSet($cache_name, function () use ($filters) {
      return self::find()
        ->where(array_merge(['is_active' => [0, 1]], $filters))
        ->count();
    }, $cache->defaultDuration, $dependency);

    return $data;
  }

  /**
   * @return mixed
   */
  public static function top12()
  {
    $language = Yii::$app->language  == Yii::$app->params['base_lang'] ? '' : '_' . Yii::$app->language;
    $cache = Yii::$app->cache;
    $dependency = new yii\caching\DbDependency;
    $dependencyName = 'top_12_stores';
    $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $dependencyName . '"';

    $data = $cache->getOrSet('top_12_stores' . $language, function () {
      return self::items()->orderBy('region_rating DESC')->limit(12)->all();
    }, $cache->defaultDuration, $dependency);
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
    $where = [];
    if(strpos($route,'-offline')){
      $where['is_offline']=1;
      $where['route']=str_replace('-offline','',$route);
    }else{
      $where['is_offline']=0;
      $where['route']=$route;
    }
    $language = Yii::$app->language  == Yii::$app->params['base_lang'] ? false : Yii::$app->language;
    $cache = Yii::$app->cache;
    $cacheName = 'store_by_route_' . $route . ($language ? '_'.$language : '');
    $dependency = new yii\caching\DbDependency;
    $dependencyName = 'stores_by_column';
    $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $dependencyName . '"';

    $data = $cache->getOrSet($cacheName, function () use ($where, $language) {
      $store =  self::find()
        ->from(self::tableName() . ' cws')
        ->select(self::selectAttributes($language))
        ->where($where);
      if ($language) {
          $store->leftJoin('lg_stores lgs', 'cws.uid = lgs.store_id and lgs.language = "' . $language . '"');
      }
      return $store->one();
    }, $cache->defaultDuration, $dependency);
    
    return $data;
  }

  /**
   * @param $id
   * @return mixed
   */
  public static function byId($id)
  {
    $cache = Yii::$app->cache;
    $dependency = new yii\caching\DbDependency;
    $dependencyName = 'stores_by_column';
    $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $dependencyName . '"';
    $language = Yii::$app->language  == Yii::$app->params['base_lang'] ? false : Yii::$app->language;
    $cacheName = 'store_byid_' . $id . ($language ? '_'.$language : '');

    $data = $cache->getOrSet($cacheName, function () use ($id, $language) {
        $store =  self::find()
            ->from(self::tableName() . ' cws')
            ->select(self::selectAttributes($language))
            ->where(['cws.uid' => $id]);
        if ($language) {
            $store->leftJoin('lg_stores lgs', 'cws.uid = lgs.store_id and lgs.language = "' . $language . '"');
        }
      return $store;
    }, $cache->defaultDuration, $dependency);

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
    parent::afterSave($insert, $changedAttributes);

    $this->saveImage();

    //todo сохранить рейтинги

    $this->clearCache($this->uid, $this->route);
  }

  public function afterDelete()
  {
    parent::afterDelete(); // TODO: Change the autogenerated stub

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
    if ($photo && $image = SdImage::save($photo, $this->getStorePath(), 143, $this->logo)) {
        $this::getDb()
            ->createCommand()
            ->update($this->tableName(), ['logo' => $image], ['uid' => $this->uid])
            ->execute();
    }
//      $path = $this->getStorePath();// Путь для сохранения
//      $oldImage = $this->logo;
//      $name = time(); // Название файла
//      $exch = explode('.', $photo->name);
//      $exch = $exch[count($exch) - 1];
//      $name .= '.' . $exch;
//      $this->logo = $name;   // Путь файла и название
//      $bp=Yii::$app->getBasePath().'/web'.$path;
//      if (!file_exists($bp)) {
//        mkdir($bp.$path, 0777, true);   // Создаем директорию при отсутствии
//      }
//      $img = (new Image($photo->tempName));
//      $img
//        ->fitToWidth(143)
//        ->saveAs($bp.$this->logo);
//      if ($img) {
//        $this->removeImage($bp.$oldImage);   // удаляем старое изображение
//        $this::getDb()
//          ->createCommand()
//          ->update($this->tableName(), ['logo' => $this->logo], ['uid' => $this->uid])
//          ->execute();
//      }
//    }
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

      if(exif_imagetype($photo->tempName)==2){
        $img = (new Image(imagecreatefromjpeg($photo->tempName)));
      }else {
        $img = (new Image($photo->tempName));
      }

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
   * @return $this
   * список шопов для разных страниц
   * применять
   * ->addSelect([..])
   * ->andWhere([...])
   * ->orderBy(...)
   * ->all()
   */
  public static function items($active = [0, 1])
  {
    $ratingQuery = (new Query())
      ->select(['cws2.uid', 'avg(cwur.rating) as rating', 'count(cwur.uid) as reviews_count'])
      ->from(self::tableName(). ' cws2')
      ->leftJoin(Reviews::tableName(). ' cwur', 'cws2.uid = cwur.store_id')
      ->leftJoin(Users::tableName(). ' cwu', 'cwu.uid = cwur.user_id')
      ->groupBy('cws2.uid')
      ->where(['cwur.is_active' => 1])
      ->andWhere(['cwu.region' => Yii::$app->params['region']]);

    $language = Yii::$app->language  == Yii::$app->params['base_lang'] ? false : Yii::$app->language;

    $stores =  self::find()
      ->from(self::tableName() . ' cws')
      ->select(array_merge(self::selectAttributes($language),[
        'store_rating.rating as reviews_rating',
        'store_rating.reviews_count as reviews_count',
        'cwsr.rating as region_rating'
      ]))
      ->leftJoin(['store_rating' => $ratingQuery], 'cws.uid = store_rating.uid')
      ->leftJoin(StoreRatings::tableName() . ' cwsr', 'cwsr.store_id = cws.uid')
      ->where(['cws.is_active' => $active, 'cwsr.region' => Yii::$app->params['region']])
      ->asArray();
    if ($language) {
        $stores->leftJoin('lg_stores lgs', 'cws.uid = lgs.store_id and lgs.language = "' . Yii::$app->language . '"');
    }
    return $stores;
  }

    /** $sortvars в зависимости от online - offline
     * @param null $offline
     * @return array
     */
  public static function sortvarItems($offline = null)
  {
    $result = [];
    foreach (self::sortvars() as $key => $sortvar) {
        if ($offline === null ||
           (empty($sortvar['no_online']) && empty($sortvar['no_offline'])) ||
           ($offline === true && !empty($sortvar['no_online'])) ||
           ($offline === false && !empty($sortvar['no_offline']))) {
               $result[$key] = $sortvar;
        }
    }
    return $result;
  }

    /**шопы разнесены по первым буквам названия
     * @param bool $forStores для шопов или для купонов
     * @param bool $charListOnly - только список или список с массивами шопов
     * @param bool $categoryId - категория шопа или купона
     * @return array
     */
  public static function getActiveStoresByAbc($options = [])
  {
    $forStores = isset($options['for_stores']) && $options['for_stores'] === false ? false : true;
    $charListOnly = !empty($options['char_list_only']) && $options['char_list_only'] == true ? true : false;
    $categoryId = !empty($options['category_id']) && $options['category_id'] > 0 ? $options['category_id'] : false;
    $offline = isset($options['offline']) && $options['offline'] !== null ? $options['offline'] : null;
    $favorites = !empty($options['favorites']) ? true : false;

    $cache = Yii::$app->cache;
    $cacheName = 'stores_abc_' . ($forStores ? 'stores' : 'coupons') . ($charListOnly ? '_list' : '') .
        ($categoryId ? '_' . $categoryId : '') . ($offline !== null ? '_offline' . $offline : '') .
        ($favorites? '_favorites' : '');
    $dependencyName = 'stores_abc';
    $dependency = new yii\caching\DbDependency;
    $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $dependencyName . '"';

    $stores = $cache->getOrSet($cacheName, function() use ($forStores, $charListOnly, $categoryId, $offline, $favorites) {
        $charList = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
            'U', 'V', 'W', 'X', 'Y', 'Z', '0&#8209;9', 'А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З', 'И', 'Й', 'К', 'Л', 'М', 'Н',
            'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Ъ', 'Ы', 'Ь', 'Э', 'Ю', 'Я'];
        if ($forStores) {
            //list for stores page
            $storesObj = self::find()
                ->from(self::tableName() . ' cws')
                ->select(['cws.name', 'cws.uid', 'cws.route', 'cws.is_offline'])
                ->where(['cws.is_active' => [0, 1]])
                ->asArray();
            if ($categoryId) {
                $storesObj->innerJoin('cw_stores_to_categories cstc', 'cws.uid = cstc.store_id')
                    ->andWhere(['cstc.category_id' => $categoryId]);
            }
            if ($offline !== null) {
                $storesObj->andWhere(['is_offline'=>$offline]);
            }
            if ($favorites) {
                $storesObj->innerJoin(UsersFavorites::tableName() . ' cuf', 'cws.uid = cuf.store_id')
                    ->andWhere(["cuf.user_id" => \Yii::$app->user->id]);
            }

            $stores = $storesObj->all();
        } else {
            //list for coupons page
            $storesObj =  Coupons::find()
                ->from(Coupons::tableName() . ' cwc')
                ->select(['cws.name', 'cws.uid', 'cws.route', 'cws.is_offline', 'count(cwc.uid) as count'])
                ->innerJoin(self::tableName() . ' cws', 'cwc.store_id = cws.uid')
                ->where(['cws.is_active' => [0, 1]])
                ->andWhere(['>', 'cwc.date_end', date('Y-m-d H:i:s', time())])
                ->groupBy('cwc.store_id')
                ->asArray();
            if ($categoryId) {
                $storesObj->innerJoin('cw_coupons_to_categories cctc', 'cwc.coupon_id = cctc.coupon_id')
                    ->andWhere(['cctc.category_id' => $categoryId]);
            }
            $stores =  $storesObj->all();
        }

        $storesByAbc = [];
        foreach ($charList as $list) {
            $storesByAbc[$list] = [];
        }
        foreach ($stores as $store) {
            $char = mb_substr(mb_strtoupper($store['name']), 0, 1);
            if (preg_match('/\d/', $char)) {
                if ($charListOnly) {
                    $storesByAbc['0&#8209;9'] = true;
                } else {
                    $storesByAbc['0&#8209;9'][] = $store;
                }
            } else {
                if ($charListOnly) {
                    $storesByAbc[$char] = true;
                } else {
                    $storesByAbc[$char][] = $store;
                }
            }
        }
        return $storesByAbc;
    }, $cache->defaultDuration, $dependency);

    return $stores;
  }



    /**
     * возвращает первый попавший ключ, входящий в массив
     * @param $items
     * @return int|string
     */
  public static function defaultSort($items)
  {
      foreach ($items as $key=>$item) {
          if (in_array($key, self::$defaultSorts)) {
              return $key;
          }
      }
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
    Cache::clearName('account_favorites');
    Cache::clearName('account_favorites_count');
    Cache::clearName('total_all_stores');
    Cache::clearName('stores_abc');
    Cache::clearName('catalog_coupons');
    Cache::clearName('top_12_stores');
    Cache::clearName('stores_by_column');

      //много зависимостей сразу
    Cache::clearAllNames('catalog_storesfavorite');
    //ключи
    //Cache::deleteName('total_all_stores');
    Cache::deleteName('categories_stores');
    if ($id) {
      Cache::deleteName('store_byid_' . $id);
    }
    if ($route) {
      Cache::deleteName('store_by_route_' . $route);
    }
    Cache::deleteName('popular_stores_with_promocodes');
  }

    /**
     * @param $query
     * @return array
     */
  public static function makeQueryArray($query)
  {
    return [
      'or',
      ['like', 'cws.name', $query],
      ['like', 'cws.alias', ', '.$query.','],
      ['like', 'cws.alias', ','.$query.','],
      ['like', 'cws.alias', ','.$query.' ,'],
      ['like', 'cws.alias', $query.' ,%', false],
      ['like', 'cws.alias', $query.',%', false],
      ['like', 'cws.alias', '%, '.$query, false],
      ['like', 'cws.alias', '%,'.$query, false],
      ['=', 'cws.alias', $query],
    ];
  }

    /**
     * массив для select
     * @param bool $language
     * @return array
     */
  private static function selectAttributes($language = false)
  {
      $attributes = ['cws.uid','cws.name','cws.route', 'cws.alias', 'cws.url', 'cws.logo', 'cws.currency', 'cws.displayed_cashback',
        'cws.added'	, 'cws.visit', 'cws.hold_time', 'cws.is_active', 'cws.active_cpa', 'cws.percent', 'cws.action_id',
        'cws.related', 'cws.is_offline', 'cws.video', 'cws.cash_number',
        'cws.url_alternative', 'cws.related_stores', 'cws.network_name', 'cws.show_notify', 'cws.show_tracking'];
      $translated = [];
      foreach (self::$translated_attributes as $attr) {
          $translated[] = $language ? 'if (lgs.' . $attr . '>"",lgs.'.$attr.',cws.'.$attr.') as '.$attr : 'cws.'.$attr;
          $translated[] = $language ? "concat('/".Yii::$app->params['lang_code']."/stores/',cws.route) as store_href" :
              "concat('/stores/',cws.route) as store_href";
      }
      return array_merge($attributes, $translated);

  }
  
}
