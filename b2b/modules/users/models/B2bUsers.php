<?php

namespace b2b\modules\users\models;

use Yii;
use yii\db\ActiveRecord;
use yii\web\IdentityInterface;
use yii\base\NotSupportedException;
use frontend\modules\stores\models\CpaLink;

/**
 * This is the model class for table "b2b_users".
 *
 * @property integer $id
 * @property string $email
 * @property string $first_name
 * @property string $last_name
 * @property string $password_hash
 * @property string $password_reset_token
 * @property string $email_confirm_token
 * @property string $auth_key
 * @property string $created_at
 * @property string $login_at
 * @property string $ip
 */
class B2bUsers extends \yii\db\ActiveRecord implements IdentityInterface
{
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
            [['email', 'fio'], 'required'],
            [['created_at', 'login_at'], 'safe'],
            [['email'], 'string', 'max' => 255],
            [['fio', 'password_hash', 'password_reset_token', 'email_confirm_token'], 'string', 'max' => 60],
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
            'fio' => 'Ф.И.О.',
            'password_hash' => 'Password Hash',
            'password_reset_token' => 'Password Reset Token',
            'email_confirm_token' => 'Email Confirm Token',
            'auth_key' => 'Auth Key',
            'created_at' => 'Created At',
            'login_at' => 'Login At',
            'ip' => 'Ip',
            'password' => 'Пороль',
        ];
    }

    public function getUserName()
    {
        return $this->fio;
    }
    public function getName()
    {
        return $this->userName;
    }

    public function getCpaLinks()
    {
        return $this->hasMany(CpaLink::className(), ['id' => 'cpa_link_id'])
            ->viaTable('b2b_users_cpa', ['user_id' => 'id']);
    }

    /**
     * Действия, выполняющиеся после авторизации.
     * Сохранение IP адреса и даты авторизации.
     *
     * Для активации текущего обновления необходимо
     * повесить текущую функцию на событие 'on afterLogin'
     * компонента user в конфигурационном файле.
     * @param $id - ID пользователя
     */
    public static function afterLogin($id)
    {
        self::getDb()->createCommand()->update(self::tableName(), [
          'ip' => $_SERVER["REMOTE_ADDR"],
          'login_at' => date('Y-m-d H:i:s'),
          'temp_key' => '',
        ], ['id' => $id])->execute();
    }
    /**
     * Finds user by email
     *
     * @param string $email
     * @return static|null
     */
    public static function findByEmail($email)
    {
        return static::findOne(['email' => $email]);
    }
    /**
     * Validates password
     *
     * @param string $password password to validate
     * @return boolean if password provided is valid for current user
     */
    public function validatePassword($password)
    {
        return Yii::$app->security->validatePassword($password, $this->password_hash);
    }

    /**
     * @inheritdoc
     */
    public function getAuthKey()
    {
        return $this->auth_key;
    }

    /**
     * @inheritdoc
     */
    public function validateAuthKey($authKey)
    {
        return $this->getAuthKey() === $authKey;
    }

    /**
     * @inheritdoc
     */
    public function getId()
    {
        return $this->getPrimaryKey();
    }
    /**
     * @inheritdoc
     */
    public static function findIdentityByAccessToken($token, $type = null)
    {
        throw new NotSupportedException('"findIdentityByAccessToken" is not implemented.');
    }
    /**
     * @inheritdoc
     */
    public static function findIdentity($id)
    {
        return static::findOne(['id' => $id]);
    }

    /**
     * Finds out if password reset token is valid
     *
     * @param string $token password reset token
     * @return bool
     */
    public static function isPasswordResetTokenValid($token)
    {
        if (empty($token)) {
            return false;
        }
        $timestamp = (int) substr($token, strrpos($token, '_') + 1);
        $expire = Yii::$app->params['user.passwordResetTokenExpire'];
        return $timestamp + $expire >= time();
    }

    /**
     * Generates new password reset token
     */
    public function generatePasswordResetToken()
    {
        $this->password_reset_token = Yii::$app->security->generateRandomString() . '_' . time();
    }
    /**
     * Generates "remember me" authentication key
     */
    public function generateAuthKey()
    {
        $this->auth_key = Yii::$app->security->generateRandomString();
    }

    /**
     * Generates password hash from password and sets it to the model
     *
     * @param string $password
     */
    public function setPassword($password)
    {
        $this->password_hash = Yii::$app->security->generatePasswordHash($password);
    }
    /**
     * Removes password reset token
     */
    public function removePasswordResetToken()
    {
        $this->password_reset_token = null;
    }
    
    public function getPassword()
    {
        return $this->password_hash;
    }
    public static function findByPasswordResetToken($token)
    {
        return self::findOne(['password_reset_token' => $token]);
    }

}
