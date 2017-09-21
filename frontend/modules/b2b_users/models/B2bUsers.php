<?php

namespace frontend\modules\b2b_users\models;

use Yii;

/**
 * This is the model class for table "b2b_users".
 *
 * @property integer $id
 * @property string $email
 * @property string $first_name
 * @property string $last_name
 * @property integer $city
 * @property string $password_hash
 * @property string $password_reset_token
 * @property string $email_confirm_token
 * @property string $auth_key
 * @property string $created_at
 * @property string $login_at
 * @property string $ip
 */
class B2bUsers extends \yii\db\ActiveRecord
{
    public $password;
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'b2b_users';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['email', 'first_name', 'last_name', 'city'], 'required'],
            [['email'], 'email'],
            [['email'], 'unique', 'message' => 'Данныей email принадлежит другому пользователю.'],
            ['password', 'trim'],
            [['password'], 'string', 'max' => 60],
            [['password'], 'string', 'min' => 5],
            [['city'], 'integer'],
            [['created_at', 'login_at'], 'safe'],
            [['email'], 'string', 'max' => 255],
            [['first_name', 'last_name', 'password_hash', 'password_reset_token', 'email_confirm_token'], 'string', 'max' => 60],
            [['auth_key'], 'string', 'max' => 32],
            [['ip'], 'string', 'max' => 20],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'email' => 'Email',
            'first_name' => 'Имя',
            'last_name' => 'Фамилия',
            'city' => 'Город',
            'password_hash' => 'Password Hash',
            'password_reset_token' => 'Password Reset Token',
            'email_confirm_token' => 'Email Confirm Token',
            'auth_key' => 'Auth Key',
            'created_at' => 'Создан',
            'login_at' => 'Последний вход',
            'ip' => 'Ip',
        ];
    }
}
