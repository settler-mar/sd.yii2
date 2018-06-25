<?php

namespace frontend\modules\actions\models;

use Yii;
use frontend\modules\users\models\Users;

/**
 * This is the model class for table "cw_actions_to_users".
 *
 * @property integer $uid
 * @property integer $action_id
 * @property integer $user_id
 * @property string $date_start
 * @property string $date_end
 * @property integer $complete
 * @property string $created_at
 *
 * @property Users $user
 * @property Actions $action
 */
class ActionsToUsers extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cw_actions_to_users';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['action_id', 'user_id'], 'required'],
            [['action_id', 'user_id'], 'integer'],
            [['date_start', 'date_end', 'created_at'], 'safe'],
            [['complete'], 'string', 'max' => 1],
            [['user_id'], 'exist', 'skipOnError' => true, 'targetClass' => Users::className(), 'targetAttribute' => ['user_id' => 'uid']],
            [['action_id'], 'exist', 'skipOnError' => true, 'targetClass' => Actions::className(), 'targetAttribute' => ['action_id' => 'uid']],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'uid' => 'Uid',
            'action_id' => 'Action ID',
            'user_id' => 'User ID',
            'date_start' => 'Date Start',
            'date_end' => 'Date End',
            'complete' => 'Complete',
            'created_at' => 'Created At',
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getUser()
    {
        return $this->hasOne(Users::className(), ['uid' => 'user_id']);
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getAction()
    {
        return $this->hasOne(Actions::className(), ['uid' => 'action_id']);
    }
}
