<?php

namespace frontend\modules\favorites\models;

use Yii;

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
}
