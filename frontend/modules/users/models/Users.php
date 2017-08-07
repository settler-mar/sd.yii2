<?php

namespace frontend\modules\users\models;

use Yii;
use yii\base\NotSupportedException;
use yii\behaviors\TimestampBehavior;
use yii\db\ActiveRecord;
use yii\web\IdentityInterface;
use developeruz\db_rbac\interfaces\UserRbacInterface;

/**
 * This is the model class for table "cw_users".
 */
class Users extends ActiveRecord implements IdentityInterface,UserRbacInterface
{

  public $new_password;
  const STATUS_DELETED = 0;
  const STATUS_ACTIVE = 1;

  /**
   * @inheritdoc
   */
  public static function tableName()
  {
    return 'cw_users';
  }

  public function getUserName()
  {
    return $this->name;
  }
  /**
   * @inheritdoc
   */
  public function behaviors()
  {
    return [

    ];
  }

  /**
   * @inheritdoc
   */
  public function rules()
  {
    return [
      [['email', 'name',  'added'], 'required'],
      [['birthday', 'last_login', 'added'], 'safe'],
      [['notice_email', 'notice_account', 'referrer_id', 'loyalty_status', 'is_active', 'is_admin', 'bonus_status', 'ref_total', 'cnt_pending', 'cnt_confirmed'], 'integer'],
      [['sum_pending', 'sum_confirmed', 'sum_from_ref_pending', 'sum_from_ref_confirmed', 'sum_to_friend_pending', 'sum_to_friend_confirmed', 'sum_foundation', 'sum_withdraw', 'sum_bonus'], 'number'],
      [['email', 'name', '!password', 'salt', 'registration_source'], 'string', 'max' => 255],
      [['sex'], 'string', 'max' => 1],
      [['last_ip'], 'string', 'max' => 100],
      [['reg_ip'], 'string', 'max' => 20],
      ['!photo', 'file', 'extensions' => 'jpeg', 'on' => ['insert']],
      [['photo'], 'image',
        'minHeight' => 500,
        'maxSize' => 2 * 1024 * 1024,
        'skipOnEmpty' => true
      ],
    ];
  }

  /**
   * @inheritdoc
   */
  public static function findIdentity($id)
  {
    return static::findOne(['uid' => $id, 'is_active' => self::STATUS_ACTIVE]);
  }

  /**
   * @inheritdoc
   */
  public function attributeLabels()
  {
    return [
      'uid' => 'Uid',
      'email' => 'Email',
      'name' => 'Name',
      'password' => 'Password',
      'salt' => 'Salt',
      'birthday' => 'Birthday',
      'sex' => 'Sex',
      'photo' => 'Photo',
      'notice_email' => 'Notice Email',
      'notice_account' => 'Notice Account',
      'referrer_id' => 'Referrer ID',
      'last_ip' => 'Last Ip',
      'last_login' => 'Last Login',
      'registration_source' => 'Registration Source',
      'added' => 'Added',
      'loyalty_status' => 'Loyalty Status',
      'is_active' => 'Is Active',
      'is_admin' => 'Is Admin',
      'bonus_status' => 'Bonus Status',
      'reg_ip' => 'Reg Ip',
      'ref_total' => 'Ref Total',
      'sum_pending' => 'Sum Pending',
      'cnt_pending' => 'Cnt Pending',
      'sum_confirmed' => 'Sum Confirmed',
      'cnt_confirmed' => 'Cnt Confirmed',
      'sum_from_ref_pending' => 'Sum From Ref Pending',
      'sum_from_ref_confirmed' => 'Sum From Ref Confirmed',
      'sum_to_friend_pending' => 'Sum To Friend Pending',
      'sum_to_friend_confirmed' => 'Sum To Friend Confirmed',
      'sum_foundation' => 'Sum Foundation',
      'sum_withdraw' => 'Sum Withdraw',
      'sum_bonus' => 'Sum Bonus',
    ];
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
      'last_ip' => $_SERVER["REMOTE_ADDR"],
      'last_login' => date('Y-m-d H:i:s'),
    ], ['uid' => $id])->execute();
  }


  public function beforeValidate()
  {
    if (!parent::beforeValidate()) {
      return false;
    }

    if ($this->isNewRecord) {
      if(!$this->name ||strlen($this->name)<1){
        $this->name=explode('@',$this->email);
        $this->name=$this->name[0];
      }

      $this->reg_ip = $_SERVER["REMOTE_ADDR"];
      $this->referrer_id =  Yii::$app->session->get('referrer_id');
      $this->added = date('Y-m-d H:i:s');
    }
    return true;

  }


  /**
   * @param bool $insert
   * @param array $changedAttributes
   * Сохраняем изображения после сохранения
   * данных пользователя
   */
  public function afterSave($insert, $changedAttributes)
  {
    $this->saveImage();
  }

  /**
   * Сохранение изображения (аватара)
   * пользвоателя
   */
  public function saveImage()
  {
    $photo = \yii\web\UploadedFile::getInstance($this, 'photo');
    if ($photo) {
      $path = $this->getUserPath($this->uid);// Путь для сохранения аватаров
      $oldImage = $this->photo;
      $name = time() . '-' . $this->uid; // Название файла
      $exch = explode('.', $photo->name);
      $exch = $exch[count($exch) - 1];
      $name .= '.' . $exch;
      $this->photo = $path . $name;   // Путь файла и название
      if (!file_exists($path)) {
        mkdir($path, 0777, true);   // Создаем директорию при отсутствии
      }
      $img = (new Image($photo->tempName));

      $img
        ->fitToWidth(500)
        ->saveAs($this->photo);
      if ($img) {
        $this->removeImage($oldImage);   // удаляем старое изображение
        $this::getDb()
          ->createCommand()
          ->update($this->tableName(), ['photo' => $this->photo], ['uid' => $this->uid])
          ->execute();
      }
    }
  }

  /**
   * Удаляем изображение при его наличии
   */
  public function removeImage($img)
  {
    if ($img) {
      // Если файл существует
      if (file_exists($img)) {
        unlink($img);
      }
    }
  }

  /**
   * Путь к папке пользователя
   * @id - ID пользователя
   * @return путь(string)
   */
  public function getUserPath($id)
  {
    $path = '/images/account/avatars/' . ($id) . '/';
    return $path;
  }

  /**
   * @inheritdoc
   */
  public static function findIdentityByAccessToken($token, $type = null)
  {
    throw new NotSupportedException('"findIdentityByAccessToken" is not implemented.');
  }

  /**
   * Finds user by username
   *
   * @param string $username
   * @return static|null
   */
  public static function findByEmail($email)
  {
    return static::findOne(['email' => $email, 'is_active' => self::STATUS_ACTIVE]);
  }

  /**
   * Finds user by password reset token
   *
   * @param string $token password reset token
   * @return static|null
   */
  public static function findByPasswordResetToken($token)
  {
    if (!static::isPasswordResetTokenValid($token)) {
      return null;
    }

    return static::findOne([
      'password_reset_token' => $token,
      'is_active' => self::STATUS_ACTIVE,
    ]);
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

    $timestamp = (int)substr($token, strrpos($token, '_') + 1);
    $expire = Yii::$app->params['user.passwordResetTokenExpire'];
    return $timestamp + $expire >= time();
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
   * Validates password
   *
   * @param string $password password to validate
   * @return bool if password provided is valid for current user
   */
  public function validatePassword($password)
  {
    return Yii::$app->security->validatePassword($password, $this->password_hash);
  }

  /**
   * Generates password hash from password and sets it to the model
   *
   * @param string $password
   */
  public function setPassword($password)
  {
    $this->new_password=$password;
    $this->password = Yii::$app->security->generatePasswordHash($password);
  }

  /**
   * Generates "remember me" authentication key
   */
  public function generateAuthKey()
  {
    $this->auth_key = Yii::$app->security->generateRandomString();
  }

  /**
   * Generates new password reset token
   */
  public function generatePasswordResetToken()
  {
    $this->password_reset_token = Yii::$app->security->generateRandomString() . '_' . time();
  }

  /**
   * Removes password reset token
   */
  public function removePasswordResetToken()
  {
    $this->password_reset_token = null;
  }
}
