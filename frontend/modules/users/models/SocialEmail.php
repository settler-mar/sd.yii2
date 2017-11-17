<?php

namespace frontend\modules\users\models;

use Yii;
use frontend\modules\users\models\Users;

/**
 * This is the model class for table "cw_users_social".
 *
 * @property integer $id
 * @property string $social_name
 * @property integer $social_id
 * @property string $name
 * @property string $email
 * @property string $url
 * @property string $logo
 * @property integer $status
 * @property string $login_at
 * @property string $last_ip
 * @property string $created_at
 * @property string $updated_at
 */
class SocialEmail extends \yii\db\ActiveRecord
{
  /**
   * @inheritdoc
   */
  public static function tableName()
  {
    return 'cw_users_social';
  }

  /**
   * @inheritdoc
   */
  public function rules()
  {
    return [
      [['social_name', 'social_id', 'email'], 'required'],
      [['user_id'], 'exist', 'targetAttribute' => 'uid', 'targetClass' => Users::className()],
      [['social_name', 'social_id'], 'string', 'max' => 255],
      [['email'], 'email'],
      [['social_name', 'social_id'], 'unique', 'targetAttribute' => ['social_name',
        'social_id'], 'message' => 'The combination of Social Name and Social ID has already been taken.'],
    ];
  }

  /**
   * @inheritdoc
   */
  public function attributeLabels()
  {
    return [
      'uid' => 'ID',
      'social_name' => 'Social Name',
      'social_id' => 'Social ID',
      'name' => 'Name',
      'email' => 'Email',
      'url' => 'Url',
      'photo' => 'Photo',
      'status' => 'Status',
      'bdate' => 'Birth Day',
      'sex' => 'Sex',
      'created_at' => 'Created At',
      'updated_at' => 'Updated At',
    ];
  }


}