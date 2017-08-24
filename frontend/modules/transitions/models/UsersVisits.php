<?php

namespace frontend\modules\transitions\models;

use Yii;

/**
 * This is the model class for table "cw_users_visits".
 *
 * @property integer $uid
 * @property integer $user_id
 * @property integer $source
 * @property string $visit_date
 * @property integer $store_id
 * @property string $user_ip
 */
class UsersVisits extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cw_users_visits';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['user_id', 'visit_date'], 'required'],
            [['user_id', 'source', 'store_id'], 'integer'],
            [['visit_date'], 'safe'],
            [['user_ip'], 'string', 'max' => 16],
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
            'source' => 'Source',
            'visit_date' => 'Visit Date',
            'store_id' => 'Store ID',
            'user_ip' => 'User Ip',
        ];
    }

  public function beforeValidate()
  {
    if (!parent::beforeValidate()) {
      return false;
    }

    if ($this->isNewRecord) {
      $this->user_ip = $_SERVER["REMOTE_ADDR"];
      $this->visit_date = date('Y-m-d H:i:s');
      $this->user_id = Yii::$app->user->id;
    }
    return true;

  }
}
