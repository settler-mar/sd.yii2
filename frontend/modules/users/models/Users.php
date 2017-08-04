<?php

namespace app\modules\users\models;

use Yii;

/**
 * This is the model class for table "cw_users".
 * @property integer $uid
 * @property string $email
 * @property string $name
 * @property string $password
 * @property string $salt
 * @property string $birthday
 * @property string $sex
 * @property string $photo
 * @property integer $notice_email
 * @property integer $notice_account
 * @property integer $referrer_id
 * @property string $last_ip
 * @property string $last_login
 * @property string $registration_source
 * @property string $added
 * @property integer $loyalty_status
 * @property integer $is_active
 * @property integer $is_admin
 * @property integer $bonus_status
 * @property string $reg_ip
 * @property integer $ref_total
 * @property double $sum_pending
 * @property integer $cnt_pending
 * @property double $sum_confirmed
 * @property integer $cnt_confirmed
 * @property double $sum_from_ref_pending
 * @property double $sum_from_ref_confirmed
 * @property double $sum_to_friend_pending
 * @property double $sum_to_friend_confirmed
 * @property double $sum_foundation
 * @property double $sum_withdraw
 * @property double $sum_bonus
 */
class Users extends \yii\db\ActiveRecord
{
  /**
   * @inheritdoc
   */
  public static function tableName()
  {
    return 'cw_users';
  }

  /**
   * @inheritdoc
   */
  public function rules()
  {
    return [
      [['email', 'name', '!password', 'salt', 'birthday', 'sex', 'referrer_id', 'last_ip', 'last_login', 'added'], 'required'],
      [['birthday', 'last_login', 'added'], 'safe'],
      [['notice_email', 'notice_account', 'referrer_id', 'loyalty_status', 'is_active', 'is_admin', 'bonus_status', 'ref_total', 'cnt_pending', 'cnt_confirmed', 'action_id'], 'integer'],
      [['sum_pending', 'sum_confirmed', 'sum_from_ref_pending', 'sum_from_ref_confirmed', 'sum_to_friend_pending', 'sum_to_friend_confirmed', 'sum_foundation', 'sum_withdraw', 'sum_bonus'], 'number'],
      [['email', 'name', '!password', 'salt', 'registration_source', 'contact_name', 'contact_phone', 'contact_email'], 'string', 'max' => 255],
      [['sex'], 'string', 'max' => 1],
      [['last_ip'], 'string', 'max' => 100],
      [['reg_ip'], 'string', 'max' => 20],
      ['!photo', 'file', 'extensions' => 'jpeg', 'on' => ['insert']],
      [['photo'], 'image',
        'minHeight' => 500,
        'maxSize'=>2*1024*1024,
        'skipOnEmpty' => true
      ],
    ];
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
      'action_id' => 'Action ID',
      'contact_name' => 'Contact Name',
      'contact_phone' => 'Contact Phone',
      'contact_email' => 'Contact Email',
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
    ], ['id' => $id])->execute();
  }


  public function beforeSave($insert)
  {
    if (!parent::beforeSave($insert)) {
      return false;
    }

    if ($this->isNewRecord) {
      $this->reg_ip=$_SERVER["REMOTE_ADDR"];
      $this->reg_ip=$_SERVER["added"];
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
      $path = $this->getUserPath($this->id);// Путь для сохранения аватаров
      $oldImage = $this->photo;
      $name = time() . '-' . $this->id; // Название файла
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
          ->update($this->tableName(), ['photo' => $this->photo], ['id' => $this->id])
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
  public function getUserPath($id) {
    $path = '/images/account/avatars/' . ($id) . '/';
    return $path;
  }
}
