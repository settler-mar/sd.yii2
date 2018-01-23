<?php

namespace frontend\modules\reviews\models;

use frontend\modules\stores\models\Stores;
use yii;
use frontend\modules\users\models\Users;
use frontend\modules\cache\models\Cache;

/**
 * This is the model class for table "cw_users_reviews".
 *
 * @property integer $uid
 * @property integer $user_id
 * @property string $title
 * @property string $text
 * @property integer $rating
 * @property string $added
 * @property integer $is_active
 * @property integer $is_top
 * @property integer $store_id
 */
class Reviews extends \yii\db\ActiveRecord
{
  /**
   * @inheritdoc
   */
  public static function tableName()
  {
    return 'cw_users_reviews';
  }

  /**
   * @inheritdoc
   */
  public function rules()
  {
    return [
      [['title', 'text', 'rating', 'user_id'], 'required'],
      [['user_id', 'rating', 'is_active', 'is_top', 'store_id'], 'integer'],
      [['added'], 'safe'],
      [['title'], 'string', 'max' => 100, 'min' => 5],
      [['text'], 'string', 'min' => 20],
      [['answer'], 'string', 'min' => 20],
    ];
  }

  /**
   * @inheritdoc
   */
  public function attributeLabels()
  {
    return [
      'uid' => 'Uid',
      'user_id' => 'Пользователь',
      'title' => 'Заголовок',
      'text' => 'Текст отзыва',
      'rating' => 'Рейтинг',
      'added' => 'Создан',
      'is_active' => 'Активный',
      'is_top' => 'Топ отзыв',
      'store_id' => 'ID магазина',
      'answer' => 'Ответ администратора',
    ];
  }

  public function beforeValidate()
  {
    if (!parent::beforeValidate()) {
      return false;
    }

    if ($this->isNewRecord) {
      $this->user_id = Yii::$app->user->id;
      $this->added = date('Y-m-d H:i:s');
    }
    //временно так - если не админ, то не публикуется после изменения
    if (!$this->isNewRecord && !Yii::$app->user->can('ReviewsEdit')) {
      $this->is_active = 0;
    }
    return true;

  }

  public function getUser()
  {
    $user = Users::findOne(['uid' => $this->user_id]);
    return $user;
  }

  public function getStore()
  {
    $user = Stores::findOne(['uid' => $this->store_id]);
    return $user;
  }

  /**
   * @return array
   */
  public static function top()
  {
    $cache = Yii::$app->cache;
    $data = $cache->getOrSet('reviews_top', function () {
      $reviews = Reviews::find()
        ->from(Reviews::tableName() . ' r')
        ->select(['r.*', 'u.name', 'u.photo', 'u.email', 'u.show_balance','u.sum_confirmed','u.sum_pending'])
        ->innerJoin(Users::tableName() . ' u', 'r.user_id = u.uid')
        ->where(['r.is_active' => 1, 'is_top' => 1, 'u.is_active' => 1])
        ->asArray()
        ->all();
      return $reviews;
    });
    return $data;
  }

  /**
   * @param $storeId
   * @return mixed
   */

  public static function byStoreId($storeId)
  {
    $cache = Yii::$app->cache;
    $dependencyName = 'reviews_catalog';
    $dependency = new yii\caching\DbDependency;
    $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $dependencyName . '"';
    $data = $cache->getOrSet('reviews_by_store_' . $storeId, function () use ($storeId) {
      $reviews = Reviews::find()
        ->from(Reviews::tableName() . ' r')
        ->select(['r.*', 'u.name', 'u.photo', 'u.email', 'u.show_balance','u.sum_confirmed','u.sum_pending'])
        ->innerJoin(Users::tableName() . ' u', 'r.user_id = u.uid')
        ->where(['r.is_active' => 1, 'u.is_active' => 1, 'r.store_id' => $storeId])
        ->orderBy('added DESC')
        ->asArray()
        ->all();
      return $reviews;
    }, $cache->defaultDuration, $dependency);
    return $data;
  }

  /**
   * @param $storeId
   * @return mixed
   */
  public static function storeRating($storeId)
  {
    $cache = Yii::$app->cache;
    $dependencyName = 'reviews_catalog';
    $dependency = new yii\caching\DbDependency;
    $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $dependencyName . '"';
    $data = $cache->getOrSet('reviews_store_rating_' . $storeId, function () use ($storeId) {
      $data = Reviews::find()
        ->from(Reviews::tableName() . ' r')
        ->select(['avg(r.rating) as avgrating', 'count(*) as reviews_count'])
        ->innerJoin(Users::tableName() . ' u', 'r.user_id = u.uid')
        ->where(['r.is_active' => 1, 'u.is_active' => 1, 'r.store_id' => $storeId])
        ->asArray()
        ->one();

      return [
        'value' => $data['avgrating'],
        //'value' => intval($data['avgrating']),
        //'value_float' => floatval($data['avgrating']),
        'reviews_count' => intval($data['reviews_count']),
      ];
    }, $cache->defaultDuration, $dependency);
    return $data;
  }
  
  public function afterSave($insert, $changedAttributes)
  {
    $this->clearCache();
  }
  public function afterDelete()
  {
    $this->clearCache();
  }
  
  private function clearCache($id = null)
  {
      //удаляем ключи
      Cache::deleteName('reviews_top');
      //обновляем зависимости
      Cache::clearName('reviews_catalog');
  }

  /**
   * @param bool $userId
   * @return int|string количество в ожидании
   */
  public static function waitingCount($userId = false)
  {
    $count =  self::find()->where(['is_active' => 0]);
    if ($userId) {
      $count = $count->andWhere(['user_id' => $userId]);
    }
    return $count->count();
  }
}
