<?php

namespace frontend\modules\reviews\models;

use Yii;
use app\modules\users\models\Users;

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
            [['user_id', 'title', 'text', 'rating', 'added'], 'required'],
            [['user_id', 'rating', 'is_active', 'is_top', 'store_id'], 'integer'],
            [['text'], 'string'],
            [['added'], 'safe'],
            [['title'], 'string', 'max' => 100],
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
            'title' => 'Title',
            'text' => 'Text',
            'rating' => 'Rating',
            'added' => 'Added',
            'is_active' => 'Is Active',
            'is_top' => 'Is Top',
            'store_id' => 'Store ID',
        ];
    }

    /**
     *
     */
    public function getUser()
    {
        return $this->hasOne(Users::className(), ['uid' => 'user_id']);
    }

    /**
     * @return array|\yii\db\ActiveRecord[]
     */
    public static function top()
    {
        return self::find()
            ->select(['cw_users_reviews.*', 'cw_users.name', 'cw_users.photo'])
            ->innerJoinWith('user')
            ->where(['cw_users_reviews.is_active' => 1, 'is_top' => 1, 'cw_users.is_active' => 1])
            ->all();
    }
}
