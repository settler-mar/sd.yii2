<?php

namespace frontend\modules\favorites\models;

use frontend\modules\stores\models\Stores;
use yii;
use frontend\modules\cache\models\Cache;

/**
 * This is the model class for table "cw_users_favorites".
 *
 * @property integer $uid
 * @property integer $user_id
 * @property string $added
 * @property integer $store_id
 */
class UsersFavorites extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cw_users_favorites';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['user_id', 'added'], 'required'],
            [['user_id', 'store_id'], 'integer'],
            [['added'], 'safe'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'uid' => 'Uid',
            'user_id' => 'User ID',
            'added' => 'Added',
            'store_id' => 'Store ID',
        ];
    }

  public function beforeValidate()
  {
    if (!parent::beforeValidate()) {
      return false;
    }

    if ($this->isNewRecord) {
      if(!isset($this->user_id) || $this->user_id==0){
        $this->user_id=Yii::$app->user->id;
      }
      $this->added = date('Y-m-d H:i:s');
    }

    return true;
  }

  public static function getUserFav($user_id=false){
    if(!$user_id){
      $user_id=Yii::$app->user->id;
    }
    $cache = Yii::$app->cache;
    return $cache->getOrSet('account_favorite_stores_'.$user_id, function () use ($user_id){
      $fav = self::find()
        ->where(['user_id'=>$user_id])
        ->asArray()
        ->all();
      $out=[];
      foreach ($fav as $item){
        $out[]=$item['store_id'];
      }
      return $out;
    });
  }

  /**
   * количество шопов у юсера
   * @param bool $user_id
   * @return mixed
   */
  public static function userFavoriteCount($userId = false, $offline=null)
  {
    if (!$userId) {
      $userId = Yii::$app->user->isGuest ? false : Yii::$app->user->id;
    }
    if (!$userId) {
      return 0;
    }
    $dependency = new yii\caching\DbDependency;
    $cache = Yii::$app->cache;
    $dependencyName = 'account_favorites_count';
    $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $dependencyName . '"';
    $cacheName = 'account_favorites_count_user_' . $userId;

    if($offline!==null){
      $cacheName.=$offline?'_offline':'_online';
    }

    return $cache->getOrSet(
      $cacheName,
      function () use ($userId,$offline) {
        $count = Stores::find()
          ->from(Stores::tableName() . ' cws')
          ->innerJoin(UsersFavorites::tableName() . ' cuf', 'cws.uid = cuf.store_id')
          ->where(["cuf.user_id" => $userId, 'cws.is_active' => [0, 1]]);

        if($offline!==null){
          $count->andWhere(['cws.is_offline' => $offline?1:0]);
        }

        $count=$count->count();
        return $count;
      },
      $cache->defaultDuration,
      $dependency
    );

  }

  public static function userFavorites()
  {
      $language = Yii::$app->language  == Yii::$app->params['base_lang'] ? false : Yii::$app->language;
      $cacheName = 'account_favorites_'. ($language ? '_' . $language : '') . \Yii::$app->user->id;
      $dependency = new yii\caching\DbDependency;
      $dependencyName = 'account_favorites';
      $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $dependencyName . '"';

      return \Yii::$app->cache->getOrSet($cacheName, function () {
          return Stores::items()
              ->innerJoin(UsersFavorites::tableName() . ' cuf', 'cws.uid = cuf.store_id')
              ->andWhere(["cuf.user_id" => \Yii::$app->user->id])
              ->orderBy('cuf.added DESC')
              ->all();
      }, \Yii::$app->cache->defaultDuration, $dependency);
  }

  /**
   * получить магазин
   * @return \yii\db\ActiveQuery
   */
  public function getStore()
  {
    return Stores::find()->where(['uid' => $this->store_id])->asArray()->one();
  }

  public function afterSave($insert, $changedAttributes)
  {
    //ключи
    Cache::deleteName('account_favorite_stores_' . $this->user_id);
    Cache::deleteName('account_favorites_' . $this->user_id);
    Cache::deleteName('account_favorites_count_user_' . $this->user_id);
    Cache::deleteName('account_favorites_count_user_' . $this->user_id. '_online');
    Cache::deleteName('account_favorites_count_user_' . $this->user_id. '_offline');
    //зависимости
    Cache::clearName('catalog_storesfavorite' . $this->user_id);

  }
  public function afterDelete()
  {
    Cache::deleteName('account_favorite_stores_' . $this->user_id);
    Cache::deleteName('account_favorites_' . $this->user_id);
    Cache::deleteName('account_favorites_count_user_' . $this->user_id);
    Cache::deleteName('account_favorites_count_user_' . $this->user_id. '_online');
    Cache::deleteName('account_favorites_count_user_' . $this->user_id. '_offline');
    //зависимости
    Cache::clearName('catalog_storesfavorite' . $this->user_id);
  }
}
