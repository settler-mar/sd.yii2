<?php

namespace frontend\modules\users\models;

use Yii;
use yii\base\NotSupportedException;
use yii\behaviors\TimestampBehavior;
use yii\db\ActiveRecord;
use yii\web\IdentityInterface;
use developeruz\db_rbac\interfaces\UserRbacInterface;
use JBZoo\Image\Image;

/**
 * This is the model class for table "cw_users".
 */
class Users extends ActiveRecord implements IdentityInterface,UserRbacInterface
{

  public $new_password;
  public $new_photo;
  const STATUS_DELETED = 0;
  const STATUS_ACTIVE = 1;

  private $balans;
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
      [['email'], 'email'],
      [['email'], 'unique','message' => 'Данныей email принадлежит другому пользователю.'],
      ['new_password', 'trim'],
      [['new_password'], 'string', 'max' => 60],
      [['new_password'], 'string', 'min' => 6],
      [['birthday', 'last_login', 'added'], 'safe'],
      [['notice_email', 'notice_account', 'referrer_id', 'loyalty_status', 'is_active', 'is_admin', 'bonus_status', 'ref_total', 'cnt_pending', 'cnt_confirmed'], 'integer'],
      [['sum_pending', 'sum_confirmed', 'sum_from_ref_pending', 'sum_from_ref_confirmed', 'sum_to_friend_pending', 'sum_to_friend_confirmed', 'sum_foundation', 'sum_withdraw', 'sum_bonus'], 'number'],
      [['email', 'name', '!password', 'salt', 'registration_source'], 'string', 'max' => 255],
      [['sex'], 'string', 'max' => 1],
      [['last_ip'], 'string', 'max' => 100],
      [['reg_ip'], 'string', 'max' => 20],
      ['!new_photo', 'file', 'extensions' => 'jpeg', 'on' => ['insert', 'update']],
      [['new_photo'], 'image',
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
      'uid' => 'id',
      'email' => 'email',
      'name' => 'Имя',
      'password' => 'Пароль',
      'new_password' => 'Новый пароль',
      'salt' => 'Salt',
      'birthday' => 'День рождения',
      'sex' => 'Пол',
      'photo' => 'Фото',
      'new_photo' => 'Фото',
      'notice_email' => 'Уведомление на почту',
      'notice_account' => 'Внутренние уведомления',
      'referrer_id' => 'Referrer ID',
      'last_ip' => 'Ip последнего входа',
      'last_login' => 'Дата последнего входа',
      'registration_source' => 'Источник регистрации',
      'added' => 'Дата регистрации',
      'loyalty_status' => 'Статус лояльности',
      'is_active' => 'Активен',
      'is_admin' => 'Is Admin',
      'bonus_status' => 'Бонусы за рефералов',
      'reg_ip' => 'Ip регистрации',
      'ref_total' => 'Всего рефералов',
      'sum_pending' => 'Ожидаемое вознаграждени',
      'cnt_pending' => 'Количество ожиаемого вознаграждения',
      'sum_confirmed' => 'Подтвержденная сумма',
      'cnt_confirmed' => 'Количество подтввержденной суммы',
      'sum_from_ref_pending' => 'Ожидаенмое вознаграждение от рефералов',
      'sum_from_ref_confirmed' => 'Подтвержденое вознаграждение от рефералов',
      'sum_to_friend_pending' => 'Sum To Friend Pending',
      'sum_to_friend_confirmed' => 'Sum To Friend Confirmed',
      'sum_foundation' => 'Сумма пожертвований',
      'sum_withdraw' => 'Выплаченная сумма',
      'sum_bonus' => 'Бонусы',
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
    if(
      !Yii::$app->session->get('admin_id') ||
      Yii::$app->session->get('admin_id')!=Yii::$app->user->id
    ){
      self::getDb()->createCommand()->update(self::tableName(), [
        'last_ip' => $_SERVER["REMOTE_ADDR"],
        'last_login' => date('Y-m-d H:i:s'),
      ], ['uid' => $id])->execute();
    }

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

    if($this->new_password){
      $this->setPassword($this->new_password);
    }
    return true;

  }

  public function beforeSave($insert)
  {

    //Если изменился баланс проверяем нужно ли менять статус лочльности
    $to_test=array('sum_confirmed','sum_from_ref_confirmed','sum_bonus');
    $total_change=false;
    foreach ($to_test as $t){
      if($this->attributes[$t]!=$this->oldAttributes[$t]){
        $total_change=true;
        break;
      }
    }
    if($total_change){
      $statuses=Yii::$app->params['dictionary']['loyalty_status'];
      $total=$this->balabce['total'];
      $status=$statuses[$this->loyalty_status];

      foreach ($statuses as $k => $status_k) {
        if (
          isset($status_k['min_sum']) && //у статса лояльности есть минимальная сумма назначения
          $status_k['min_sum']<$total  &&//минимальная сумма ниже заработанной суммы
          $status_k['bonus']>$status['bonus'] //новый бонус будет выгоднее клиенту чем текущий
        ){
          $status=$status_k;
          $this->loyalty_status=$k;
        }
      }
    }

    return parent::beforeSave($insert); // TODO: Change the autogenerated stub
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
    $photo = \yii\web\UploadedFile::getInstance($this, 'new_photo');
    if ($photo) {
      $path = $this->getUserPath($this->uid);// Путь для сохранения аватаров
      $oldImage = $this->photo;
      $name = time(); // Название файла
      $exch = explode('.', $photo->name);
      $exch = $exch[count($exch) - 1];
      $name .= '.' . $exch;
      $this->photo = $path . $name;   // Путь файла и название
      $bp=Yii::$app->getBasePath().'/web';
      if (!file_exists($bp.$path)) {
        mkdir($bp.$path, 0777, true);   // Создаем директорию при отсутствии
      }
      $img = (new Image($photo->tempName));
      $img
        ->fitToWidth(500)
        ->saveAs($bp.$this->photo);
      if ($img) {
        $this->removeImage($bp.$oldImage);   // удаляем старое изображение
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
      if (is_readable($img) && is_file($img)) {
       // ddd($img);
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


  public function getBalabce(){
    if(!$this->balans) {
      $confirmed_sum =
        floatval($this->sum_confirmed) +
        floatval($this->sum_from_ref_confirmed);
      $pending_sum =
        floatval($this->sum_pending) +
        floatval($this->sum_from_ref_pending);
      $sum_bonus =
        floatval($this->sum_bonus);

      $bl = [
        'total' => $confirmed_sum + $sum_bonus,
        'pending' => $pending_sum,
        'charity' => $this->sum_foundation,
        'withdraw' => $this->sum_withdraw,
      ];

      $bl['current'] = $bl['total'] - $bl['charity'] - $bl['withdraw'];

      $balance = $this->sum_confirmed + $this->sum_from_ref_confirmed + $this->sum_bonus -
        $this->sum_foundation - $this->sum_withdraw;
      if ($this->sum_confirmed + $this->sum_from_ref_confirmed + $this->sum_bonus < 350) {
        $bl['max_fundation'] = 0;
      } else if ($balance < 0) {
        $bl['max_fundation'] = 0;
      } else {
        $bl['max_fundation'] = $balance;
      }

      foreach ($bl as $k => &$v) {
        $v = number_format($v, 2, ".", "");
      }
      $this->balans = $bl;
    }
    return $this->balans;
  }

  public function getRegistration_source_href(){ //ссылка на источник регистрации
    $value=$this->registration_source;
    if($value!='default' && $value!=''){
      $value='<a href="'.$value.'" target=_blank>';
      $social_name=explode('//',$this->registration_source);
      $social_name=explode('/',$social_name[1]);
      $social_name=str_replace('www.','',$social_name[0]);
      $value.=$social_name.'</a>';
    }else{
      $value="форма";
    }
    return $value;
  }

  public function getDrive(){//email и ссылка на того кто привел
    if($this->referrer_id<1){
      return '';
    }
    $user=Users::find()
      ->where(['uid'=>$this->referrer_id])->one();
    return $user->email;
  }

  public function getLoyalty_status_data(){
    $ls=$this->loyalty_status;
    $loyalty_status_list=Yii::$app->params['dictionary']['loyalty_status'];
    if(!isset($loyalty_status_list[$ls])){
      return 'Ошибка';
    }
    return $loyalty_status_list[$ls];
  }

  public function getBonus_status_data(){
    $bs=$this->loyalty_status;
    $Bonus_status_list=Yii::$app->params['dictionary']['bonus_status'];
    if(!isset($Bonus_status_list[$bs])){
      return 'Ошибка';
    }
    return $Bonus_status_list[$bs];
  }

  public function getLast_ip_count(){
    return Yii::$app->cache->getOrSet('ip_count_'.$this->last_ip, function () {
      $count=Users::find()
        ->orWhere(['last_ip'=>$this->last_ip])
        ->orWhere(['reg_ip'=>$this->last_ip])
        ->count();
      return $count;
    });
  }

  public function getReg_ip_count(){
    return Yii::$app->cache->getOrSet('ip_count_'.$this->reg_ip, function () {
      $count=Users::find()
        ->orWhere(['last_ip'=>$this->reg_ip])
        ->orWhere(['reg_ip'=>$this->reg_ip])
        ->count();
      return $count;
    });
  }

  public function getCurrentBalance(){
    $bl=$this->getBalabce();
    return $bl['current'];
  }

  public function getPending(){
    $bl=$this->getBalabce();
    return $bl['pending'];
  }
}
