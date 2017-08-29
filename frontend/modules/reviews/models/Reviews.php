<?php

namespace frontend\modules\reviews\models;

use Yii;
use frontend\modules\users\models\Users;

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
            [['title', 'text', 'rating'], 'required'],
            [['user_id', 'rating', 'is_active', 'is_top', 'store_id'], 'integer'],
            [['added'], 'safe'],
            [['title'], 'string', 'max' => 100, 'min' => 5],
            [['text'], 'string', 'min' => 20],
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
            'added' => 'Added',
            'is_active' => 'Активный',
            'is_top' => 'Топ отзыв',
            'store_id' => 'ID магазина',
        ];
    }

  public function beforeValidate()
  {
    if (!parent::beforeValidate()) {
      return false;
    }

    if ($this->isNewRecord) {
      $this->user_id =  Yii::$app->user->id;
      $this->added = date('Y-m-d H:i:s');
    }

    return true;

  }

    /**
     *
     */
    public function getUser()
    {
        return $this->hasOne(Users::className(), ['uid' => 'user_id']);
    }

    /**
     * @return array
     */
    public static function top()
    {
        $cache = Yii::$app->cache;
        $data = $cache->getOrSet('reviews_top', function () {
            $reviews = Reviews::find()
                ->from(Reviews::tableName().' r')
                ->select(['r.*', 'u.name', 'u.photo'])
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
        $data = $cache->getOrSet('reviews_by_store_'.$storeId, function () use ($storeId) {
            $reviews = Reviews::find()
                ->from(Reviews::tableName().' r')
                ->select(['r.*', 'u.name', 'u.photo'])
                ->innerJoin(Users::tableName() . ' u', 'r.user_id = u.uid')
                ->where(['r.is_active' => 1, 'u.is_active' => 1, 'r.store_id' => $storeId])
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
    public static function storeRating($storeId)
    {
        $cache = Yii::$app->cache;
        $data = $cache->getOrSet('reviews_store_rating_'.$storeId, function () use ($storeId) {
            $data = Reviews::find()
                ->from(Reviews::tableName().' r')
                ->select(['avg(r.rating) as avgrating', 'count(*) as reviews_count'])
                ->innerJoin(Users::tableName() . ' u', 'r.user_id = u.uid')
                ->where(['r.is_active' => 1, 'u.is_active' => 1, 'r.store_id' => $storeId])
                ->asArray()
                ->one();
            $rating = intval($data['avgrating']);
            $reviewsCount = intval($data['reviews_count']);

            return [
              'value' => $rating,
              'reviews_count' => $reviewsCount,
            ];
        });
        return $data;
    }
}
