<?php

namespace frontend\modules\users\models;

use Yii;

/**
 * This is the model class for table "cw_user_ip_log".
 *
 * @property integer $id
 * @property integer $user_id
 * @property string $created
 * @property string $ip
 *
 * @property CwUsers $user
 */
class UserIpLog extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cw_user_ip_log';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['user_id'], 'integer'],
            [['created'], 'safe'],
            [['ip'], 'required'],
            [['ip'], 'string'],
            //[['user_id'], 'exist', 'skipOnError' => true, 'targetClass' => CwUsers::className(), 'targetAttribute' => ['user_id' => 'uid']],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'user_id' => 'User ID',
            'created' => 'Created',
            'ip' => 'Ip',
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getUser()
    {
        return $this->hasOne(CwUsers::className(), ['uid' => 'user_id']);
    }
}
