<?php

namespace frontend\modules\users\models;

use frontend\models\Task;
use frontend\modules\favorites\models\UsersFavorites;
use frontend\modules\notification\models\Notifications;
use frontend\modules\reviews\models\Reviews;
use frontend\modules\stores\models\Stores;
use frontend\modules\transitions\models\UsersVisits;
use frontend\modules\withdraw\models\UsersWithdraw;
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

  const trafficTypeList = [
      0 => 'Веб-сайт/Блог',
      1 => 'Паблик в соцсетях',
      2 => 'YouTube-канал',
      3 => 'Дорвей',
      4 => 'Email-рассылка',
      5 => 'Другое'
    ];

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
      [['email', 'name', 'added'], 'required'],
      [['email'], 'email'],
      [['email'], 'unique', 'message' => Yii::t('account', 'save_settings_email_exists')],
      ['new_password', 'trim'],
      [['new_password'], 'string', 'max' => 60],
      [['new_password'], 'string', 'min' => 5],
      [['birthday', 'last_login', 'added'], 'safe'],
      [['notice_email', 'notice_account', 'referrer_id', 'loyalty_status', 'is_active', 'is_admin', 'bonus_status', 'ref_total', 'cnt_pending', 'cnt_confirmed','email_verified'], 'integer'],
      [['sum_pending', 'sum_confirmed', 'sum_from_ref_pending', 'sum_from_ref_confirmed', 'sum_to_friend_pending', 'sum_to_friend_confirmed', 'sum_foundation', 'sum_withdraw', 'sum_bonus'], 'number'],
      [['email', 'name', '!password', 'registration_source'], 'string', 'max' => 255],
      [['sex'], 'string', 'max' => 1],
      [['last_ip'], 'string', 'max' => 100],
      [['reg_ip'], 'string', 'max' => 20],
      ['!new_photo', 'file', 'extensions' => 'jpeg', 'on' => ['insert', 'update']],
      [['new_photo'], 'image',
        'minHeight' => 500,
        'maxSize' => 2 * 1024 * 1024,
        'skipOnEmpty' => true
      ],
      [['waitModeration','traffType','show_balance'],'number'],
      ['url','string']

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
      'email' => 'Email',
      'name' => Yii::t('account', 'user_name'),
      'password' => 'Пароль',
      'new_password' => 'Новый пароль',
      'birthday' => Yii::t('account', 'account_user_burthday'),
      'sex' => Yii::t('account', 'sex'),
      'photo' => 'Фото',
      'new_photo' => 'Фото',
      'notice_email' => 'Уведомление на почту',
      'notice_account' => 'Внутренние уведомления',
      'referrer_id' => 'Referrer ID',
      'last_ip' => 'IP последнего входа',
      'last_login' => 'Дата последнего входа',
      'registration_source' => 'Источник регистрации',
      'added' => 'Дата регистрации',
      'loyalty_status' => 'Статус лояльности',
      'is_active' => 'Активен',
      'is_admin' => 'Is Admin',
      'bonus_status' => 'Бонусы за рефералов',
      'reg_ip' => 'IP регистрации',
      'ref_total' => 'Всего рефералов',
      'sum_pending' => 'Ожидаемый кэшбэк, руб',
      'cnt_pending' => 'Ожидаемый кэшбэк, шт',
      'sum_confirmed' => 'Подтвержденный кэшбэк, руб',
      'cnt_confirmed' => 'Подтвержденный кэшбэк, шт',
      'sum_from_ref_pending' => 'Ожидаемое вознаграждение от рефералов',
      'sum_from_ref_confirmed' => 'Подтвержденное вознаграждение от рефералов',
      'sum_to_friend_pending' => 'Sum To Friend Pending',
      'sum_to_friend_confirmed' => 'Sum To Friend Confirmed',
      'sum_foundation' => 'Сумма пожертвований',
      'sum_withdraw' => 'Выплаченная сумма',
      'sum_bonus' => 'Бонусы',
      'email_verify_time' => 'Последнее письмо с валидаций',
      'email_verified' => 'Статус валидации',
      'waitModeration' => 'Ожидает модерации',
      'traffType' => 'Источник трафика',
      'url' => 'Сайт',
      'show_balance' => 'Отображаемый баланс',
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
    if (
      !Yii::$app->session->get('admin_id') ||
      Yii::$app->session->get('admin_id') != Yii::$app->user->id
    ) {
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
    if (!$this->name || strlen($this->name) == 0) {
      $this->name = explode('@', $this->email);
      $this->name = $this->name[0];
    }

    if ($this->isNewRecord) {
      $this->reg_ip = $_SERVER["REMOTE_ADDR"];
      $this->referrer_id = (int)Yii::$app->session->get('referrer_id');
      $this->added = date('Y-m-d H:i:s');

      if (!isset($this->auth_key)) {
        $this->auth_key = '';
      }
    }

    if ($this->new_password) {
      $this->setPassword($this->new_password);
    }
    return true;

  }

  public function testLoyality()
  {
    $statuses = Yii::$app->params['dictionary']['loyalty_status'];
    $total = $this->balance['total'];
    $status = $statuses[$this->loyalty_status];

    foreach ($statuses as $k => $status_k) {
      if (
        isset($status_k['min_sum']) && //у статса лояльности есть минимальная сумма назначения
        $status_k['min_sum'] < $total &&//минимальная сумма ниже заработанной суммы
        $status_k['bonus'] > $status['bonus'] //новый бонус будет выгоднее клиенту чем текущий
      ) {
        $status = $status_k;
        $this->loyalty_status = $k;
      }
    }
  }

  public function beforeSave($insert)
  {
    //Если изменился баланс проверяем нужно ли менять статус лояльности
    $to_test = array('sum_confirmed', 'sum_from_ref_confirmed', 'sum_bonus');
    $total_change = false;
    foreach ($to_test as $t) {
      if (isset($this->attributes[$t]) && $this->attributes[$t] != $this->oldAttributes[$t]) {
        $total_change = true;
        break;
      }
    }
    if ($total_change) {
      $this->testLoyality();
    }

    if ($this->isNewRecord) {
      $this->new_loyalty_status_end = time() + 10 * 24 * 60 * 60;
      $this->old_loyalty_status = 0;
      $this->loyalty_status = 4;
      $this->bonus_status = 0;

      //ссылки промо
      $promo = Yii::$app->session->get('referrer_promo') ? Yii::$app->session->get('referrer_promo') : 'default';
      if ($promo && !empty(Yii::$app->params['ref_promo']) && !empty(Yii::$app->params['ref_promo'][$promo])) {
        $promos = isset(Yii::$app->params['ref_promo'][$promo]) ? Yii::$app->params['ref_promo'][$promo] : [];
        if(isset($promos['time'])){
          if($promos['time']===false){
            $this->new_loyalty_status_end = 0;
          }else{
            $this->new_loyalty_status_end = time() + $promos['time'] * 24 * 60 * 60;
          }
          unset ($promos['time']);
        }
        foreach ($promos as $field => $promo) {
          $this->$field = $promo;
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
    if ($insert) {
      if ($this->referrer_id > 0) {
        Yii::$app->balanceCalc->todo($this->referrer_id, 'ref');
      }

      //если создание произошло не из под админа(авторизированного пользователя)
      if(Yii::$app->user->isGuest) {
        Yii::$app->session->setFlash('success', [
          'title' => 'Успешная авторизация',
          'message' => 'Рекомендуем посетить <a href="/account?new=1">личный кабинет</a>,' .
            ' а также изучить <a href="/recommendations">Правила покупок с кэшбэком</a>',
          'no_show_page'=>['account']
        ]);
        if($this->waitModeration) {
          Yii::$app->session->setFlash('info', [
            'title' => 'Заявка на модерации',
            'message' => 'Ваша заявка вебмастера принята. Ожидайте ответа администратора. После одобрения на ваш e-mail придет письмо с подтверждением.'
          ]);
        };
      }

      if($this->new_loyalty_status_end>time()) {
        $notify = new Notifications();
        $notify->user_id = $this->uid;
        $notify->type_id = 2;
        $notify->status = 2;
        $notify->amount = 0;
        $notify->payment_id = 0;
        $notify->twig_template = 3;
        $notify->text = date('d.m.Y', $this->new_loyalty_status_end);
        $notify->save();


        //задание на отключение ремиуи статуса
        $task = new Task();
        $task->param = -$this->uid; // - Что б понимать что это приемиуи за регистрацию
        $task->task = 2;
        $task->add_time = $this->new_loyalty_status_end;
        $task->save();
      }

      $store = Stores::top12(12);

      try {
        Yii::$app
          ->mailer
          ->compose(
            ['html' => 'welcome-html', 'text' => 'welcome-text'],
            [
              'user' => $this,
              'stores' => $store,
            ]
          )
          ->setFrom([Yii::$app->params['adminEmail'] => Yii::$app->params['adminName']])
          ->setTo($this->email)
          ->setSubject(Yii::$app->name . ': Регистрация')
          ->send();
      } catch (\Exception $e) {
      }
    }
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

      if(!is_readable($photo->tempName)){
        Yii::$app->session->addFlash('err','Ошибка обновления аватарки. попробуйте другой файл или повторите процедуру позже.');
        return;
      }

      $name = time(); // Название файла
      $exch = explode('.', $photo->name);
      $exch = $exch[count($exch) - 1];
      $name .= '.' . $exch;
      $this->photo = $path . $name;   // Путь файла и название
      $bp = Yii::$app->getBasePath() . '/web';
      if (!file_exists($bp . $path)) {
        mkdir($bp . $path, 0777, true);   // Создаем директорию при отсутствии
      }

      if(exif_imagetype($photo->tempName)==2){
        $img = (new Image(imagecreatefromjpeg($photo->tempName)));
      }else {
        $img = (new Image($photo->tempName));
      }

      $img
        ->fitToWidth(500)
        ->saveAs($bp . $this->photo);
      if ($img) {
        $this->removeImage($bp . $oldImage);   // удаляем старое изображение
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
    return Yii::$app->security->validatePassword($password, $this->password);
  }

  /**
   * Generates password hash from password and sets it to the model
   *
   * @param string $password
   */
  public function setPassword($password)
  {
    $this->new_password = $password;
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


  public function getBalance()
  {
    if (!$this->balans) {
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
      $bl['withdraw_waiting'] = UsersWithdraw::waitingCount($this->uid);
      $this->balans = $bl;
    }
    return $this->balans;
  }

  public function getRegistration_source_href()
  { //ссылка на источник регистрации
    $value = $this->registration_source;
    if ($value != 'default' && $value != '') {
      $value = '<a href="' . $value . '" target=_blank>';
      $social_name = explode('//', $this->registration_source);
      $social_name = explode('/', $social_name[1]);
      $social_name = str_replace('www.', '', $social_name[0]);
      $value .= $social_name . '</a>';
    } else {
      $value = "форма";
    }
    return $value;
  }

  public function getDrive()
  {//email и ссылка на того кто привел
    if ($this->referrer_id < 1) {
      return '';
    }
    $user = Users::find()
      ->where(['uid' => $this->referrer_id])->one();
    return $user->email;
  }

  public function getLoyalty_status_data()
  {
    $ls = $this->loyalty_status;
    $loyalty_status_list = Yii::$app->params['dictionary']['loyalty_status'];
    if (!isset($loyalty_status_list[$ls])) {
      return 'Ошибка';
    }
    return $loyalty_status_list[$ls];
  }

  public function getOld_loyalty_status_data()
  {
    $ls = $this->old_loyalty_status;
    $loyalty_status_list = Yii::$app->params['dictionary']['loyalty_status'];
    if (!isset($loyalty_status_list[$ls])) {
      return 'Ошибка';
    }
    return $loyalty_status_list[$ls];
  }

  public function getBonus_status_data()
  {
    $bs = $this->bonus_status;
    $Bonus_status_list = Yii::$app->params['dictionary']['bonus_status'];
    if (!isset($Bonus_status_list[$bs])) {
      return 'Ошибка';
    }
    return $Bonus_status_list[$bs];
  }

  public function getLast_ip_count()
  {
    return Yii::$app->cache->getOrSet('ip_count_' . $this->last_ip, function () {
      $count = Users::find()
        ->orWhere(['last_ip' => $this->last_ip])
        ->orWhere(['reg_ip' => $this->last_ip])
        ->count();
      return $count;
    });
  }

  public function getReg_ip_count()
  {
    return Yii::$app->cache->getOrSet('ip_count_' . $this->reg_ip, function () {
      $count = Users::find()
        ->orWhere(['last_ip' => $this->reg_ip])
        ->orWhere(['reg_ip' => $this->reg_ip])
        ->count();
      return $count;
    });
  }

  public function getCurrentBalance()
  {
    $bl = $this->getBalance();
    return $bl['current'];
  }

  public function getPending()
  {
    $bl = $this->getBalance();
    return $bl['pending'];
  }

  public function beforeDelete()
  {

    UsersFavorites::deleteAll(['user_id' => $this->uid]);
    Notifications::deleteAll(['user_id' => $this->uid]);
    Reviews::deleteAll(['user_id' => $this->uid]);
    UsersVisits::deleteAll(['user_id' => $this->uid]);
    UsersSocial::deleteAll(['user_id' => $this->uid]);


    return parent::beforeDelete(); // TODO: Change the autogenerated stub
  }

  public function afterDelete()
  {
    if ($this->referrer_id > 0) {
      Yii::$app->balanceCalc->todo($this->referrer_id, 'ref');
    }

    parent::afterDelete(); // TODO: Change the autogenerated stub
  }

  public function getBarcode(){
    return 'SD-'.str_pad($this->uid, 8, "0", STR_PAD_LEFT);
  }

  public function getBarcodeImg($onlyTest=false){
    /*
      $code_src='https://barcode.tec-it.com/barcode.ashx?data='.$this->all_params['user_code'].'&code=Code128&dpi=96';
      $generator = new \Picqer\Barcode\BarcodeGeneratorPNG();
      $code_src = $generator->getBarcode($this->all_params['user_code'], $generator::TYPE_CODE_128);
     */

    $centerCode = 160; //центр по горизонтали для вставки кода
    $insertY=335; //положение кода по вертикали
    $insertH=100; //высота штрихкода
    $textY=460; //положение текста по вертикали
    $fontSize=20; //Размер шрифта текста
    $font='/phpfont/DejaVuSerif.ttf'; // шрифт

    $code=$this->getBarcode();
    $file=$code.'.jpg';
    $path=$this->getUserPath($this->uid);

    $bp = Yii::$app->getBasePath() . '/web';
    if (!file_exists($bp . $path)) {
      if($onlyTest)return false;
      mkdir($bp . $path, 0777, true);   // Создаем директорию при отсутствии
    }

    if(!file_exists($bp . $path.$file) || filemtime($bp.'/images/barcode_file.png')>filemtime($bp . $path.$file)){
      if($onlyTest)return false;
      $generator = new \Picqer\Barcode\BarcodeGeneratorPNG();
      $barcode = imagecreatefromstring($generator->getBarcode($code, $generator::TYPE_CODE_128));
      ImageAlphaBlending($barcode, true);
      $bW = ImageSX($barcode);
      $bH = ImageSY($barcode);

      //$fon = imageCreateFromJpeg($bp.'/images/barcode_file.jpg');
      $fon = ImageCreateFromPNG($bp.'/images/barcode_file.png');
      imagealphablending($fon, true);
      imagecolortransparent($fon, 0xFF00FF);
      imagesavealpha($fon, true);

      //вставляем код на подложку
      $insertX=$centerCode-$bW/2;
      $insertW=$bW;

      imagecopyresized($fon, $barcode,
        $insertX, $insertY, //insert pos
        0, 0, //code pos
        $insertW,$insertH, //insert size
        $bW, $bH //code size
      );

      //добавлеям текст на подложку
      $black = imagecolorallocate($fon, 0, 0, 0);
      $font = $bp.$font;

      $textSize=imagettfbbox($fontSize, 0, $font, $code);

      $x=$centerCode-$textSize[2]/2;
      imagettftext($fon, $fontSize, 0, $x, $textY, $black, $font, $code);

      /*header('Content-Type: image/png');
      ImagePNG($fon);
      exit;*/

      ImageJPEG($fon,$bp . $path.$file); // вывод в браузер
    }

    return $path.$file;
  }

  public static function waitModerationCount()
  {
      return self::find()->where(['waitModeration' => 1])->count();
  }
}
