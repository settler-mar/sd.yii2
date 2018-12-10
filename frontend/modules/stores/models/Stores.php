<?php

namespace frontend\modules\stores\models;

use common\models\Admitad;
use frontend\modules\ar_log\behaviors\ActiveRecordChangeLogBehavior;
use yii;
use frontend\modules\stores\models\CategoriesStores;
use frontend\modules\coupons\models\CategoriesCoupons;
use frontend\modules\coupons\models\Coupons;
use frontend\modules\reviews\models\Reviews;
use frontend\modules\favorites\models\UsersFavorites;
use frontend\modules\users\models\Users;
use frontend\modules\transitions\models\UsersVisits;
use frontend\modules\products\models\Products;
use shop\modules\product\models\Product;
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
      'contact_name', 'contact_phone', 'contact_email', 'coupon_description', 'description_extend'
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
          'contact_email','video','network_name','coupon_description', 'region', 'description_extend'], 'string'],
      [['alias', 'description', 'conditions', 'short_description', 'contact_name', 'contact_phone',
          'contact_email','video','network_name','coupon_description', 'region', 'description_extend'], 'trim'],
      [['added'], 'safe'],
      [['visit', 'hold_time', 'is_active', 'active_cpa', 'percent', 'action_id', 'is_offline', 'related',
          'cash_number', 'show_notify','show_tracking', 'watch_transitions','test_link'], 'integer'],
      [['name', 'route', 'url','url_alternative', 'logo', 'local_name', 'related_stores'], 'string', 'max' => 255],
      [['currency', 'settlement_currency'], 'string', 'max' => 3],
      [['displayed_cashback'], 'string', 'max' => 30],
      [['route'], 'unique', 'targetAttribute' =>['route','is_offline']],
      [['route'], 'unique', 'targetAttribute' =>'route', 'targetClass' => CategoriesStores::className()],
      [['route'], 'unique', 'targetAttribute' =>'route', 'targetClass' => CategoriesCoupons::className()],
      [['related'], 'compare', 'compareAttribute' => 'uid', 'operator' => '!='],
      [['related'], 'exist', 'targetAttribute' => 'uid'],
      ['!logoImage', 'file', 'extensions' => 'jpeg', 'on' => ['insert', 'update']],
      ['action_end_date', 'match', 'pattern' => '/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/i','message'=>"Формат даты YYYY-MM-DD"],
      [['logoImage'], 'image',
        'minHeight' => 80,
        'minWidth' => 192,
        'maxHeight' => 80,
        'maxWidth' => 192,
        'maxSize' => 10 * 1024 * 1024,
        'skipOnEmpty' => true
      ],
      [['videos', 'regions'], 'safe'],
      ['regions_list', 'in', 'allowArray' => true, 'range' => array_keys(Yii::$app->params['regions_list'])],
      ['display_on_plugin', 'in', 'range' => [0, 1, 2, 3], 'skipOnEmpty' => 1],
      [['show_products', 'hide_on_site'], 'in', 'range' => [0, 1], 'skipOnEmpty' => 1],
      [['updated_at'], 'safe'],
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
      'desctiption_extend' => 'Дополнительное описание',
      'show_products' => 'Отображать страницу с продуктами',
      'status_updated' => 'Изменение статуса',
      'test_link' => 'Блок теста ссылок',
      'hide_on_site' => 'Скрывать на основном сайте',
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

    /**
     * @return yii\db\ActiveQuery
     */
  public function getProducts()
  {
    return $this->hasMany(Products::className(), ['store_id' => 'uid']);
  }

  /**
   * @return yii\db\ActiveQuery
   */
  public function getTopProducts()
  {
    return $this->hasMany(Products::className(), ['store_id' => 'uid'])
        ->limit(4)
        ->orderBy('last_price desc')
        ->where(['and',
            ['is not', 'url', null],
            ['>', 'url', ''],
            ['<>', 'title', '-'],
        ]);
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

    if($this->currency=="RUR"){
      $this->currency="RUB";
    }

    if($this->action_id>0 && !empty($this->action_end_date) && strtotime($this->action_end_date.' 23:59:59')<time()){
      $this->action_id=0;
    }
    $displayed_cashback = preg_replace('/[^0-9\.\,]/', '', $this->displayed_cashback);
    $displayed_cashback = str_replace(',','.', $displayed_cashback);
    $upto = (strpos($this->displayed_cashback, 'до') === 0);
    $in_curency=(strpos($this->displayed_cashback, '%') === false);
    //$displayed_cashback_filtred = round((float) $displayed_cashback,$in_curency ? 2 : 0);
    $displayed_cashback_filtred = round((float) $displayed_cashback,2);
    $this->displayed_cashback = ($upto ? 'до ' : '') . $displayed_cashback_filtred . ($in_curency ? '': '%');
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
        ->where(array_merge(['is_active' => [0, 1], 'hide_on_site' => 0], $filters))
        ->count();
    }, $cache->defaultDuration, $dependency);

    return $data;
  }

  /**
   * теперь 10 шопов
   * @return mixed
   */
  public static function top12($region = 'defaut')
  {
    $language = Yii::$app->language  == Yii::$app->params['base_lang'] ? '' : '_' . Yii::$app->language;
    $cache = Yii::$app->cache;
    $dependency = new yii\caching\DbDependency;
    $dependencyName = 'top_12_stores';
    $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $dependencyName . '"';

    $data = $cache->getOrSet('top_12_stores' . $language, function () {
      return self::items()->orderBy('region_rating DESC')->limit(10)->all();
    }, $cache->defaultDuration, $dependency);
     return $data;
  }

    /**
     * просмотренные шопы
     * @param int $userId
     * @return bool|mixed
     */
  public static function visited($userId = 0, $limit = 0)
  {
      $userId = $userId > 0  ? $userId : (Yii::$app->user->isGuest ? 0 : Yii::$app->user->id);
      if ($userId == 0) {
          return false;
      }
      $language = Yii::$app->language  == Yii::$app->params['base_lang'] ? '' : '_' . Yii::$app->language;

      $cache = Yii::$app->cache;
      $cache_name = 'stores_visited' . $language . '_' . $userId. '_' . $limit;
      $dependency = new yii\caching\DbDependency;
      $dependencyName = 'stores_visited';
      $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $dependencyName . '"';
      $data = $cache->getOrSet($cache_name, function () use ($userId, $limit) {
          $visits = UsersVisits::find()
              ->select(['cw_users_visits.store_id', 'max(visit_date) as visit_date'])
              ->where(['user_id' => $userId])
              ->andWhere(['>', 'visit_date', date('Y-m-d H:i:s', time() - 7 * 24 * 60 * 60)])
              ->groupBy('store_id');

          $stores = self::items()
              ->innerJoin(['cwuv' => $visits], 'cwuv.store_id = cws.uid')
              ->orderBy('cwuv.visit_date DESC');
          $count = $stores->count();
          if ($limit > 0) {
              $stores->limit($limit);
          }
          return [
              'count' => $count,
              'stores' => $stores->all(),
          ];
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

    $language = isset(Yii::$app->params['base_lang']) && Yii::$app->language  == Yii::$app->params['base_lang'] ? false : Yii::$app->language;
    $cache = Yii::$app->cache;
    $cacheName = 'store_by_route_' . $route . ($language ? '_'.$language : '');
    $dependency = new yii\caching\DbDependency;
    $dependencyName = 'stores_by_column';
    $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $dependencyName . '"';

    $data = $cache->getOrSet($cacheName, function () use ($where, $language) {
      $store =  self::find()
        ->from(self::tableName() . ' cws')
        ->select(self::selectAttributes($language))
        ->where($where)
        ->andWhere(['hide_on_site' => 0]);
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
      return $store->one();
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

    if (in_array('is_active', array_keys($this->dirtyAttributes))) {
      if (isset($this->oldAttributes['added']) && strtotime($this->oldAttributes['added']) < time() - 60) {
          //только старые записи
        if (!isset($this->oldAttributes['is_active']) || $this->attributes['is_active'] != $this->oldAttributes['is_active']) {
          $this->status_updated = date('Y-m-d H:i:s');
        }
      }
    }
    if (in_array('updated_at', array_keys($this->attributes))) {
        $this->updated_at = date('Y-m-d H:i:s');
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

//    //удаляем купоны
//    $coupons = Coupons::find()
//      ->where(['store_id' => $this->uid])
//      ->all();
//    foreach ($coupons as $coupon){
//      $coupon->delete();
//    }
//
//    //удаляем отзывы
//    $reviews = Reviews::find()
//      ->where(['store_id' => $this->uid])
//      ->all();
//    foreach ($reviews as $review){
//      $review->delete();
//    }

    $path = $this->getStorePath();// Путь для сохранения
    $bp=Yii::$app->getBasePath().'/web'.$path;
    $this->removeImage($bp.$this->logo);   // удаляем старое изображение

    $this->clearPhotos(); //чистим фотки магазина
    //B2bStoresPoints::deleteAll(['store_id'=>$this->uid]);//удаление торговых точек
  }
  public function beforeDelete()
  {
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

      //cpa links
      $cpaLinks = CpaLink::find()
          ->where(['stores_id' => $this->uid])
          ->all();
      foreach ($cpaLinks as $cpaLink) {
          $cpaLink->delete();
      }

      //переводы
      $langs = LgStores::find()
          ->where(['store_id' => $this->uid])
          ->all();
      foreach ($langs as $lang) {
          $lang->delete();
      }

      //торговые точки
      $storePoints = B2bStoresPoints::find()
          ->where(['store_id' => $this->uid])
          ->all();
      foreach ($storePoints as $storePoint) {
          $storePoint->delete();
      }
      //продукты
      $products = Products::find()
          ->where(['store_id' => $this->uid])
          ->all();
      foreach ($products as $product) {
          $product->delete();
      }
      //шоп к категории
      $categoriesStores = StoresToCategories::find()
          ->where(['store_id' => $this->uid])
          ->all();
      foreach ($categoriesStores as $categoriesStore) {
          $categoriesStore->delete();
      }
      //рейтинг
      $storeRatings = StoreRatings::find()
          ->where(['store_id' => $this->uid])
          ->all();
      foreach ($storeRatings as $storeRating) {
          $storeRating->delete();
      }

      return parent::beforeDelete();
  }

  /**
   * Сохранение изображения (аватара)
   * пользвоателя
   */
  public function saveImage()
  {
    $photo = \yii\web\UploadedFile::getInstance($this, 'logoImage');
    if ($photo && $image = SdImage::save($photo, $this->getStorePath(), 192, $this->logo)) {
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
      ->leftJoin(StoreRatings::tableName() . ' cwsr', 'cwsr.store_id = cws.uid and cwsr.region = "'.Yii::$app->params['region'].'"')
      ->where(['cws.is_active' => $active, 'cws.hide_on_site' => 0])
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
    $visited = !\Yii::$app->user->isGuest && !empty($options['visited']) ? true : false;

    $cache = Yii::$app->cache;
    $cacheName = 'stores_abc_' . ($forStores ? 'stores' : 'coupons') . ($charListOnly ? '_list' : '') .
        ($categoryId ? '_' . $categoryId : '') . ($offline !== null ? '_offline' . $offline : '') .
        ($favorites ? '_favorites' : '').($visited ? '_visited' : '');
    $dependencyName = 'stores_abc';
    $dependency = new yii\caching\DbDependency;
    $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $dependencyName . '"';

    $stores = $cache->getOrSet($cacheName, function() use ($forStores, $charListOnly, $categoryId, $offline, $favorites, $visited) {
        $charList = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
            'U', 'V', 'W', 'X', 'Y', 'Z', '0&#8209;9', 'А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З', 'И', 'Й', 'К', 'Л', 'М', 'Н',
            'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Ъ', 'Ы', 'Ь', 'Э', 'Ю', 'Я'];
        if ($forStores) {
            //list for stores page
            $storesObj = self::find()
                ->from(self::tableName() . ' cws')
                ->select(['cws.name', 'cws.uid', 'cws.route', 'cws.is_offline'])
                ->where(['cws.is_active' => [0, 1], 'hide_on_site' => 0])
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
            if ($visited && !\Yii::$app->user->isGuest) {
                $storesObj->innerJoin(UsersVisits::tableName() . ' cwuv', 'cws.uid = cwuv.store_id')
                    ->andWhere(["cwuv.user_id" => \Yii::$app->user->id]);
            }

            $stores = $storesObj->all();
        } else {
            //list for coupons page
            $storesObj =  Coupons::find()
                ->from(Coupons::tableName() . ' cwc')
                ->select(['cws.name', 'cws.uid', 'cws.route', 'cws.is_offline', 'count(cwc.uid) as count'])
                ->innerJoin(self::tableName() . ' cws', 'cwc.store_id = cws.uid')
                ->where(['cws.is_active' => [0, 1], 'hide_on_site' => 0])
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
    Cache::clearName('stores_visited');


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
    Cache::deleteName('sitemap_xml');
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
        'cws.added'	, 'cws.visit', 'cws.hold_time', 'cws.is_active', 'cws.action_end_date', 'cws.active_cpa', 'cws.percent', 'cws.action_id',
        'cws.related', 'cws.is_offline', 'cws.video', 'cws.cash_number',
        'cws.url_alternative', 'cws.related_stores', 'cws.network_name', 'cws.show_notify', 'cws.show_tracking', 'show_products','cws.test_link'];
      $translated = [];
      $lang_code=isset(Yii::$app->params['lang_code'])?Yii::$app->params['lang_code']:Yii::$app->language;
      foreach (self::$translated_attributes as $attr) {
          //$translated[] = $language ? 'if (lgs.' . $attr . '>"",lgs.'.$attr.',cws.'.$attr.') as '.$attr : 'cws.'.$attr;
          $translated[] = $language ? 'lgs.' . $attr. ' as '.$attr : 'cws.'.$attr;
          $translated[] = $language ? "concat('/".$lang_code."/stores/',cws.route) as store_href" :
              "concat('/stores/',cws.route) as store_href";
      }
      return array_merge($attributes, $translated);

  }

    /**
     * запись шопа из консольных action
     * @param $store
     * @return array
     */
  public static function addOrUpdate($store)
  {
    $transaction = Yii::$app->getDb()->beginTransaction();

      $cpa_id = false;
      $db_store = false;
      $new = false;
      $result = false;
      $newCpa = false;
      $resultCpa = false;
      $logo = null;

      $cpa_link = CpaLink::findOne(['cpa_id' => $store['cpa_id'], 'affiliate_id' => $store['affiliate_id']]);

      //чистим URL
      $url = str_replace("https://", "%", $store['url']);
      $url = str_replace("http://", "%", $url);
      $url = str_replace("www.", "", $url);
      //$url=explode('/',$url);
      //$url=$url[0].'%';

      $urlArr = explode('.', $url);
      $urlShort =  implode('.', array_slice($urlArr, 0, count($urlArr) - 1));
      $route = Yii::$app->help->str2url($url);
      $routeShort = Yii::$app->help->str2url($urlShort);

      if (!empty($store['logo'])) {
          $logo = explode(".", $store['logo']);
          $logo = 'cw' . $store['cpa_id'] . '_' .$route.'.'. $logo[count($logo) - 1];
          $logo = str_replace('_', '-', $logo);
      }


      if ($cpa_link) {
          //если CPA link нашли то проверяем ссылку и при необходимости обновляем ее
          if ($cpa_link->affiliate_link != $store['affiliate_link']) {
              $cpa_link->affiliate_link = $store['affiliate_link'];
              $cpa_link->save();
          }

          $cpa_id = $cpa_link->id;

          //переходим от ссылки СПА на магазин
          $db_store = $cpa_link->store;

          /*
           * Лого обновляем если
           * - лого был прописан данной CPA (тут подумать еще)
           * - нет лого
           * - лого от адмитада
           */

          if ($db_store && (
                  $db_store->logo == $logo ||
                  !$db_store->logo ||
                  strpos($db_store->logo, 'cw1-') !== false ||
                  strpos($db_store->logo, 'cw'.$store['cpa_id'].'-') !== false ||
                  strpos($db_store->logo, 'cw_') !== false
              )) {
              $test_logo = true;
          } else {
              $test_logo = false;
          }
      } else {
          $test_logo = true;
      }


      //если лого то проверяем его наличие и размер и при нобходимости обновляем
      if ($test_logo && $logo && !empty($store['logo'])) {
          //обрабатываем лого и если обновление то меняем имя
          if(self::saveLogo($logo, $store['logo'], $db_store ? $db_store->logo : false) && $db_store){
              $db_store->logo=$logo;
          };
      }

      //если магазин не нашли по прямому подключению пробуем найти по косвеным признакам

      //поиск по ссылке на магазин
      if (!$db_store) {
          //Проверяем существования магазина на основании его адреса
          $url = trim($url, '/') . '%';
          $db_store = self::find()->where(['like', 'url', $url, false])->one();
      }

      //поиск по ссылке на роуту
      if (!$db_store) {
          $db_store = self::find()->where(['route' => [$route, $routeShort]])->one();
      }

      //Если магазин так и не нашли то создаем
      if (!$db_store) {
          $new = true;
          $db_store = new Stores();
          $db_store->name = $store['name'];
          $db_store->description = !empty($store['description']) ? $store['description'] : null;
          $db_store->short_description = !empty($store['short_description']) ? $store['short_description'] : null;
          $db_store->conditions = !empty($store['conditions']) ? $store['conditions'] : null;
          $db_store->route = $route;
          $db_store->url = $store['url'];
          $db_store->logo = $logo;
          $db_store->currency = $store['currency'];
          $db_store->percent = 50;
          $db_store->hold_time =  $store['hold_time'];
          $db_store->displayed_cashback = isset($store['cashback'])? $store['cashback'] : '';
          $db_store->is_active = isset($store['status']) ? $store['status'] : 1;
          $db_store->alias = !empty($store['alias']) ? $store['alias'] : null;
          $db_store->hide_on_site = isset($store['hide_on_site']) ? $store['hide_on_site'] : 0;
          if ($db_store->save()) {
              $result = true;
          } else {
              if (Yii::$app instanceof Yii\console\Application){
                  d($db_store->errors);
              }
          }
      }

      $store_id = $db_store->uid;

      //если нет в базе CPA ЛИНК то создаем ее
      if (!$cpa_id) {
          $newCpa = true;
          $cpa_link = new CpaLink();
          $cpa_link->cpa_id = $store['cpa_id'];
          $cpa_link->stores_id = $store_id;
          $cpa_link->affiliate_id = $store['affiliate_id'];
          $cpa_link->affiliate_link = $store['affiliate_link'];
          if (!$cpa_link->save()) {
              if (Yii::$app instanceof Yii\console\Application){
                  d($cpa_link->errors);
              }
              return [
                  'result' => $result,
                  'new' => $new,
                  'newCpa' => $newCpa,
                  'resultCpa' => $resultCpa,
              ];

          } else {
              $resultCpa = true;
          }
          $cpa_id = $cpa_link->id;
      } else {
          //проверяем свяль CPA линк и магазина
          if ($cpa_link->stores_id != $store_id) {
              $cpa_link->stores_id = $store_id;
              $cpa_link->save();
          }
      }

      $cpa_id=(int)$cpa_id;

      //если СPA не выбранна то выставляем текущую
      if ((int)$db_store->active_cpa == 0 || empty($db_store->active_cpa)) {
          $db_store->active_cpa = $cpa_id;
      }

      if ($db_store->active_cpa == $cpa_id) {
          // спа активная, обновляем поля - какие - можно потом добавить
          $db_store->url = $store['url'] ? $store['url'] : $db_store->url;
          //$db_store->displayed_cashback = isset($store['cashback']) ? $store['cashback'] : $db_store->displayed_cashback;
          //$db_store->description = !empty($store['description']) ? $store['description'] : $db_store->description;
          //$db_store->short_description = !empty($store['short_description']) ? $store['short_description'] : $db_store->short_description;
          //$db_store->conditions = !empty($store['conditions']) ? $store['conditions'] : $db_store->conditions;
          //$db_store->alias = !empty($store['alias']) ? $store['alias'] : $db_store->alias;
          $db_store->currency = $store['currency'];
          if ($db_store->is_active != -1 && isset($store['status'])) {
              $db_store->is_active = $store['status'];
          }

      }
      if ($db_store->save()) {
          $result = true;
      };

      if(!$result || ($newCpa && !$resultCpa)){

      }else{

        if(isset($store['actions']) && $store['actions']){
          foreach ($store['actions'] as $action){
            $is_new_action = $newCpa;

            //если магазин был в базе то проверяем есть у него данное событие
            if (!$is_new_action) {
              $action_r = StoresActions::findOne(['cpa_link_id' => $cpa_id, 'action_id' => $action['action_id']]);
            }

            //если магазин новый или не нашли событие то создаем его
            if ($is_new_action || !$action_r) {
              $action_r = new StoresActions();
              $action_r->cpa_link_id = $cpa_id;
              $action_r->action_id = $action['action_id'];
              $action_r->name = $action['name'];
              $action_r->hold_time = $action['hold_time'];
              $action_r->type = $action['type'];
              if (!$action_r->save()) {
                continue;
              };
              $is_new_action = true;
            }

            $action_id = $action_r->uid;// код события
            foreach ($action['tariffs'] as $tariff) {
              $is_new_tarif = $is_new_action;

              if (!$is_new_action) {
                $tariff_r = ActionsTariffs::findOne(['id_tariff' => $tariff['tariff_id'], 'id_action' => $action_id]);
              }

              if ($is_new_action || !$tariff_r) {
                $tariff_r = new ActionsTariffs();
                $tariff_r->id_tariff = $tariff['tariff_id'];
                $tariff_r->id_action = $action_id;
                $tariff_r->name = $tariff['name'];
                $tariff_r->validate();
                if (!$tariff_r->save()) {
                  continue;
                };
                $is_new_tarif = true;
              }

              $tariff_id = $tariff_r->uid;
              foreach ($tariff['rates'] as $rate) {
                if (!$is_new_tarif) {
                  $f_value = [
                      'id_tariff' => $tariff_id,
                      'id_rate' => $rate['rate_id']
                  ];
                  if (isset($rate['additional_id']) && strlen($rate['additional_id']) > 1) {
                    $f_value['additional_id'] = $rate['additional_id'];
                  }
                  $rate_r = TariffsRates::findOne($f_value);
                }

                //если запись новая
                if ($is_new_tarif || !$rate_r) {
                  $rate_r = new TariffsRates;
                  $rate_r->auto_update = 1;
                  $rate_r->id_tariff = $tariff_id;
                  $rate_r->id_rate = $rate['rate_id'];
                  $rate_r->is_percentage = $rate['is_percentage']?1:0;
                  $rate_r->additional_id = isset($rate['additional_id']) ? $rate['additional_id'] : '';
                  $rate_r->date_s = $rate['date_s'];
                }

                if ($rate_r->auto_update == 0) { //при запрете автообновления
                  continue;
                }
                $rate_r->size = $rate['size'];
                $rate_r->price_s = $rate['price_s'];
                $rate_r->our_size = $rate['size']/2;
                $rate_r->save();
                //ddd($rate_r);
              }

            }
          }
        }
        $transaction->commit();
        $transaction->rollBack();
      }
      return [
          'result' => $result,
          'new' => $new,
          'newCpa' => $newCpa,
          'resultCpa' => $resultCpa,
          'store' => $db_store,
          'cpa_link' => $cpa_link,
      ];
  }

    /** обновление лого из CPA
     * @param $logo
     * @param $logoNew
     * @param $db_logo
     * @return bool
     */
  public static function saveLogo($logo, $logoNew, $db_logo)
  {
    $needUpdate = false;
    $imageSizeNeed = 192;
    $path = Yii::$app->getBasePath() . '/../frontend/web/images/logos/';
    if (!file_exists($path)) {
        mkdir($path, 0777, true);
    }
    try {
        if (file_exists($path . $logo)) {
            $imageSize = getimagesize($path . $logo);
            $needUpdate = !isset($imageSize[0]) || !isset($imageSize[1]) ||
                    ($imageSize[0] < $imageSizeNeed && $imageSize[1] < $imageSizeNeed);
        }
        if (!file_exists($path . $logo) || $needUpdate) {
            $file = file_get_contents($logoNew);
            if (!$file) {
                return false;
            }
            $image = new Image($file);
            $image->bestFit($imageSizeNeed, $imageSizeNeed);
            $image->saveAs($path . $logo);
            if ($db_logo && $logo != $db_logo && file_exists($path . $db_logo)) {
                unlink($path . $db_logo);
            }
            return true;
        } else {
            return false;
        }
    } catch (\Exception $e) {
        if (Yii::$app instanceof Yii\console\Application){
            echo $e->getMessage() . "\n";
        }
        return false;
    }
  }

  public function testLink($url){
    $cpaLink = CpaLink::findOne(['stores_id'=>$this->uid,'cpa_id'=>1]);

    $url=explode('//',$url);
    $url=trim($url[count($url)-1],'/');
    $site=explode('/',$url);
    $site=trim($site[0],'www.');

    $is_normal=false;
    $base_url = $this->url.(strlen($this->url_alternative)>5?','.$this->url_alternative:"");

    $base_url=explode(",",$base_url);
    foreach ($base_url as $link){
      $link=explode('//',$link);
      $link=trim($link[count($link)-1],'/');
      $link=explode('/',$link);
      $link=trim($link[0],'www.');

      if($link==$site){
        //совпал основной сайт
        $is_normal=true;
        break;
      }
      $link='.'.$link;
      if(substr($site, strlen($site) - strlen($link)) == $link){
        //совпал суб доменом
        $is_normal=true;
        break;
      }
    }

    if(!$is_normal)return $is_normal;


    $url="https://".$url;

    $options=[
        'subid'=>Yii::$app->user->isGuest?0:Yii::$app->user->id,
        'ulp'=>$url,
    ];

    $admitad = new Admitad(Yii::$app->params['admitad']);

    $dp_link=$admitad->getDeeplink($cpaLink->affiliate_id,$options);
    if(count($dp_link)==0)return Yii::t('main',"test_link_not_support");
    $options=[
        'link'=>$dp_link[0]
    ];
    $msg=$admitad->getTestLink($options);

    return $msg;
  }

    /**
     * Имеющие товары
     * @return array
     */
  public static function usedByCatalog()
  {
      $cache = Yii::$app->cache;
      $path= 'stores_used_by_catalog';
      return $cache -> getOrSet($path, function () {
          return  Stores::find()->select(['cw_stores.uid', 'cw_stores.name'])
              ->innerJoin(Product::tableName().' p', 'p.store_id = cw_stores.uid')
              ->groupBy(['cw_stores.uid', 'cw_stores.name'])
              ->asArray()
              ->all();
      });
  }
}
