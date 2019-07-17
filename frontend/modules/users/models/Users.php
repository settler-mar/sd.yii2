<?php

namespace frontend\modules\users\models;

use frontend\models\Task;
use frontend\modules\favorites\models\UsersFavorites;
use frontend\modules\notification\models\Notifications;
use frontend\modules\reviews\models\Reviews;
use frontend\modules\stores\models\Stores;
use frontend\modules\transitions\models\UsersVisits;
use frontend\modules\withdraw\models\UsersWithdraw;
use frontend\modules\promos\models\Promos as DbPromo;
use api\models\OauthClients;
use Yii;
use yii\base\NotSupportedException;
use yii\behaviors\TimestampBehavior;
use yii\db\ActiveRecord;
use yii\web\IdentityInterface;
use developeruz\db_rbac\interfaces\UserRbacInterface;
use JBZoo\Image\Image;
use common\components\SdImage;
use common\components\DataValidator;
use common\components\Help;
use frontend\modules\template\models\Template;

/**
 * This is the model class for table "cw_users".
 */
class Users extends ActiveRecord implements IdentityInterface, UserRbacInterface
{

  public $new_password;
  public $new_photo;
  const STATUS_DELETED = 0;
  const STATUS_ACTIVE = 1;

//  const trafficTypeList = [
//      0 => 'Веб-сайт/Блог',
//      1 => 'Паблик в соцсетях',
//      2 => 'YouTube-канал',
//      3 => 'Дорвей',
//      4 => 'Email-рассылка',
//      5 => 'Другое'
//  ];

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

  public static function trafficTypeList()
  {
     return [
         0 => Yii::t('account', 'traffic_type_web'),
         1 => Yii::t('account', 'traffic_type_social_network'),
         2 => Yii::t('account', 'traffic_type_youtube'),
         3 => Yii::t('account', 'traffic_type_doorway'),
         4 => Yii::t('account', 'traffic_type_email'),
         5 => Yii::t('account', 'traffic_type_other'),
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
        [['currency'], 'string', 'min' => 3],
        [['currency'], 'string', 'max' => 3],
        [['last_login', 'added', 'new_loyalty_status_end', 'in_action'], 'safe'],
        [['birthday'], DataValidator::className()],
        [['notice_email', 'notice_email_status', 'notice_account', 'referrer_id', 'loyalty_status', 'is_active', 'is_admin', 'bonus_status', 'ref_total', 'cnt_pending', 'cnt_confirmed', 'email_verified'], 'integer'],
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
        [['waitModeration', 'traffType', 'show_balance'], 'number'],
        [['url', 'delete_comment'], 'string'],

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
        'notice_email_status' => 'Уведомления на электронную почту при повышении статуса лояльности',
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
        'sum_pending' => 'Ожидаемый кэшбэк ',
        'cnt_pending' => 'Ожидаемый кэшбэк, шт',
        'sum_confirmed' => 'Подтвержденный кэшбэк',
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
        'in_action' => 'Участвует в акции с ',
        'delete_comment' => 'Причина удаления',
        'language' => 'Язык',
        'region' => 'Регион',
        'currency' => 'Валюта',
        'sum_declined'=>'Сумма отменённого',
        'cnt_declined'=>'Количество отменённого',
        'new_loyalty_status_end' => 'Окончание нового статуса лояльности',
        'old_loyalty_status' => 'Прежний статус лояльности'

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
  public static function afterLogin($id,$event=false)
  {
    if(strpos(Yii::$app->request->url,'logout'))return;
    if (
        !Yii::$app->session->get('admin_id') ||
        Yii::$app->session->get('admin_id') != Yii::$app->user->id
    ) {
      self::getDb()->createCommand()->update(self::tableName(), [
          'last_ip' => get_ip(),
          'last_login' => date('Y-m-d H:i:s'),
      ], ['uid' => $id])->execute();

      if(strpos(Yii::$app->request->url,'login') || strpos(Yii::$app->request->url,'socials-auth')){
        $ip_log = new UserIpLog();
        $ip_log->user_id = $id;
        $ip_log->ip = get_ip();
        $ip_log->save();
      }

    }

  }

  public function afterFind()
  {
    parent::afterFind(); // TODO: Change the autogenerated stub
    if ($this->birthday) {
      $this->birthday = explode('-', $this->birthday);
      if(strlen($this->birthday[0])==4){
        $this->birthday  = array_reverse($this->birthday);
      }
      $this->birthday = implode('-', $this->birthday);
    }
  }

  public function beforeValidate()
  {
    if (!is_numeric($this->new_loyalty_status_end)) {
      if ($this->new_loyalty_status_end == '') {
        $this->new_loyalty_status_end = 0;
      } else {
        $t = explode(' ', $this->new_loyalty_status_end);
        $t[0] = explode('/', $t[0]);
        $t1 = $t[0][0];
        $t[0][0] = $t[0][1];
        $t[0][1] = $t1;

        $t[0] = implode('/', $t[0]);
        $this->new_loyalty_status_end = implode(' ', $t);
        $this->new_loyalty_status_end = strtotime($this->new_loyalty_status_end);
      }
    }

    if ($this->new_loyalty_status_end < time()) {
      $this->new_loyalty_status_end = 0;
      $tasks = Task::find()->where([
          'param' => [$this->uid, -$this->uid],
          'task' => 2
      ])->all();

      foreach ($tasks as $task) {
        $task->delete();
      }
    }

    if (!parent::beforeValidate()) {
      Yii::$app->logger->add($this, 'user_validate_error', false);
      return false;
    }

    if (!$this->name || strlen($this->name) == 0) {
      $this->name = explode('@', $this->email);
      $this->name = $this->name[0];
    }

    if ($this->isNewRecord) {
      $this->reg_ip = get_ip();
      //$this->referrer_id = (int)Yii::$app->session->get('referrer_id');
      $this->added = date('Y-m-d H:i:s');

      if (!isset($this->auth_key)) {
        $this->auth_key = '';
      }

      $this->is_active = self::STATUS_ACTIVE;
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
    $loyalty_status = $this->loyalty_status;

    foreach ($statuses as $k => $status_k) {
      if (
          isset($status_k['min_sum'][$this->currency]) && //у статса лояльности есть минимальная сумма назначения
          $status_k['min_sum'][$this->currency] < $total &&//минимальная сумма ниже заработанной суммы
          $status_k['bonus'] > $status['bonus'] //новый бонус будет выгоднее клиенту чем текущий
      ) {
        $status = $status_k;
        $this->loyalty_status = $k;
      }
    }
    if ($this->save() && $loyalty_status  != $this->loyalty_status && $this->notice_email_status) {
        //изменился статус лояльности - письмо пользователю, если задано в настройках
      try {
          Template::mail('loyalty_status', $this->email, [
              'user' => $this,
          ]);

      } catch (\Exception $e) {
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
      $referrer_id = Yii::$app->session->get('referrer_id') &&
        self::findOne((int) Yii::$app->session->get('referrer_id')) ?
          (int) Yii::$app->session->get('referrer_id') : false;
      if ($promo) {
          $dbPromo = DbPromo::findByCode($promo);
          if ($dbPromo) {
              if ($dbPromo->new_loyalty_status_end > 0) {
                  $dbPromo->new_loyalty_status_end = time() + $dbPromo->new_loyalty_status_end * 24 * 60 * 60;
              }
              foreach ($dbPromo->attributesToUser as $field) {
                  $this->$field = $dbPromo->$field;
              }
          }
      }
      //$referrer_id=8;
      if ($referrer_id) {
          $this->referrer_id = $referrer_id;
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
    if (Yii::$app instanceof Yii\console\Application){
        return;
    };

    if ($insert) {
      if ($this->referrer_id > 0) {
        Yii::$app->balanceCalc->todo($this->referrer_id, 'ref');
      }

      //если создание произошло не из под админа(авторизированного пользователя)
      if (Yii::$app->user->isGuest) {
        Yii::$app->session->setFlash('success', [
            'title' => Yii::t('account', 'authorize_success'),
            'message' => Yii::t(
                'account',
                'authorize_recommendations_visit_<a href="{profile}">profile</a>_and_learn<a href="{terms}">terms</a>_before',
                [
                    'profile' => Help::href('/account?new=1'),
                    'terms' => Help::href('/recommendations')
                ]
            ),
            'no_show_page' => ['account']
        ]);
        if ($this->waitModeration) {
          Yii::$app->session->setFlash('info', [
              'title' => Yii::t('account', 'moderation_request_title'),
              'message' => Yii::t('account', 'moderation_request_message')
          ]);
        };
      }

      if ($this->new_loyalty_status_end > time()) {
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

      //$store = Stores::top12(12);

      try {
         // пока отключили письмо при регистрации
//          Template::mail('welcome', $this->email, [
//              'user' => $this,
//          ]);
      } catch (\Exception $e) {
      }
    } else {
      //if not insertd
      if (Yii::$app->user->identity && Yii::$app->user->identity->is_admin && isset($changedAttributes['email_verified']) &&
          $changedAttributes['email_verified'] == 0 && $this->email_verified == '1') {
        //админ поменял статус емейл на подтверждён
        try {
            Template::mail('verify_email_success', $this->email, [
                'user' => $this,
            ]);
          Yii::$app->session->addFlash('info', Yii::t('account', 'email_confirm_email_message'));
        } catch (\Exception $e) {
        }
      }
    }
    $this->saveImage();

    if ($this->birthday) {
      $this->birthday = explode('-', $this->birthday);
      if(strlen($this->birthday[0])==4){
        $this->birthday  = array_reverse($this->birthday);
      }
      $this->birthday = implode('-', $this->birthday);
    }
  }

    /**
     * промокод для аккаунта
     * @param $promoName
     */
  public function applyPromo($promoId)
  {
      if (!$promoId) {
          return false;
      }
      $dbPromo = DbPromo::find()->where(['uid' => $promoId])->one();
      if ($dbPromo) {
          foreach ($dbPromo->attributesToUser as $field) {
              if ($field == 'new_loyalty_status_end') {
                  $this->$field = $dbPromo->$field > 0 ? $dbPromo->$field   * 24 * 60 * 60 : $dbPromo->$field;
              } else {
                  $this->$field = $dbPromo->$field;
              }
          }
          return $dbPromo;
      }
  }

  /**
   * Сохранение изображения (аватара)
   * пользвоателя
   */
  public function saveImage()
  {
    $photo = \yii\web\UploadedFile::getInstance($this, 'new_photo');

    $userPath = $this->getUserPath($this->uid);
    if ($photo && $image = SdImage::save($photo, $userPath, 500, substr($this->photo, strlen($userPath)),"jpg")){
        $this::getDb()
            ->createCommand()
            ->update($this->tableName(), ['photo' => $userPath . $image], ['uid' => $this->uid])
            ->execute();
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
      if ($this->sum_confirmed + $this->sum_from_ref_confirmed + $this->sum_bonus < 0) {
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
      $value = '<a href="' . $value . '" target=_blank rel="nofollow noopener">';
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

  public function getLoyalty_status_text()
  {
    $ls = $this->loyalty_status;
    $loyalty_status_list = Yii::$app->params['dictionary']['loyalty_status'];
    if (!isset($loyalty_status_list[$ls])) {
      return 'Ошибка';
    }
    return $loyalty_status_list[$ls]['display_name'];
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
    if (!$this->bonus_status) $this->bonus_status = 0;
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
      //Yii::$app->balanceCalc->todo($this->referrer_id, 'ref');
    }

    parent::afterDelete(); // TODO: Change the autogenerated stub
  }

  public function getBarcode()
  {
    return 'SD-' . str_pad($this->uid, 8, "0", STR_PAD_LEFT);
  }

  public function getBarcodeImg($onlyTest = false)
  {
    /*
      $code_src='https://barcode.tec-it.com/barcode.ashx?data='.$this->all_params['user_code'].'&code=Code128&dpi=96';
      $generator = new \Picqer\Barcode\BarcodeGeneratorPNG();
      $code_src = $generator->getBarcode($this->all_params['user_code'], $generator::TYPE_CODE_128);
     */

    $centerCode = 160; //центр по горизонтали для вставки кода
    $insertY = 335; //положение кода по вертикали
    $insertH = 100; //высота штрихкода
    $textY = 460; //положение текста по вертикали
    $fontSize = 20; //Размер шрифта текста
    $font = '/phpfont/DejaVuSerif.ttf'; // шрифт

    $code = $this->getBarcode();
    $file = $code . '.jpg';
    $path = $this->getUserPath($this->uid);

    $bp = Yii::$app->getBasePath() . '/web';
    if (!file_exists($bp . $path)) {
      if ($onlyTest) return false;
      mkdir($bp . $path, 0777, true);   // Создаем директорию при отсутствии
    }

    if (!file_exists($bp . $path . $file) || filemtime($bp . '/images/barcode_file.png') > filemtime($bp . $path . $file)) {
      if ($onlyTest) return false;
      $generator = new \Picqer\Barcode\BarcodeGeneratorPNG();
      $barcode = imagecreatefromstring($generator->getBarcode($code, $generator::TYPE_CODE_128));
      ImageAlphaBlending($barcode, true);
      $bW = ImageSX($barcode);
      $bH = ImageSY($barcode);

      //$fon = imageCreateFromJpeg($bp.'/images/barcode_file.jpg');
      $fon = ImageCreateFromPNG($bp . '/images/barcode_file.png');
      imagealphablending($fon, true);
      imagecolortransparent($fon, 0xFF00FF);
      imagesavealpha($fon, true);

      //вставляем код на подложку
      $insertX = $centerCode - $bW / 2;
      $insertW = $bW;

      imagecopyresized($fon, $barcode,
          $insertX, $insertY, //insert pos
          0, 0, //code pos
          $insertW, $insertH, //insert size
          $bW, $bH //code size
      );

      //добавлеям текст на подложку
      $black = imagecolorallocate($fon, 0, 0, 0);
      $font = $bp . $font;

      $textSize = imagettfbbox($fontSize, 0, $font, $code);

      $x = $centerCode - $textSize[2] / 2;
      imagettftext($fon, $fontSize, 0, $x, $textY, $black, $font, $code);

      /*header('Content-Type: image/png');
      ImagePNG($fon);
      exit;*/

      ImageJPEG($fon, $bp . $path . $file); // вывод в браузер
    }

    return $path . $file;
  }

  public static function waitModerationCount()
  {
    return self::find()->where(['waitModeration' => 1])->count();
  }

  public static function this()
  {
    if (Yii::$app->user->isGuest) {
      return false;
    }
    return self::find()->where(['uid' => Yii::$app->user->id])->one();
  }

  public function testActivity(){
    return Yii::$app->security->validatePassword($this->email,$this->password);
  }

  public function getAction()
  {
    return Users::find()
        ->alias('user')
        ->andFilterWhere(['>', 'user.in_action', 0])
        ->join('LEFT JOIN', 'cw_users ref', 'ref.referrer_id = user.uid and ref.added > user.in_action')
        ->select([
            'count(ref.uid) as reg_by_action',
            'sum(if(ref.sum_confirmed>350,1,0)) as finish_by_action',
        ])
        ->groupBy('user.uid')
        ->where(['user.uid' => $this->uid])
        ->asArray()
        ->one();
  }

  public function getOauthClient()
  {
      return $this->hasOne(OauthClients::className(), ['user_id' => 'uid']);
  }

  public static function onActionCount()
  {
    return self::find()
        ->alias('user')
        ->andFilterWhere(['>', 'user.in_action', 0])
        ->andFilterWhere(['>=', 'ref.sum_confirmed', 350])
        ->andFilterWhere(['<>', 'user.loyalty_status', 4])
        ->join('LEFT JOIN', 'cw_users ref', 'ref.referrer_id = user.uid and ref.added > user.in_action')
        ->groupBy('user.uid')
        ->count();
  }

  public static function calculate($where = [], $params = [])
  {
      $allParams = ['ref_total','sum_from_ref_pending','sum_from_ref_confirmed',
          'cnt_pending', 'sum_pending','cnt_confirmed','sum_confirmed','cnt_declined','sum_declined','sum_to_friend_pending','sum_to_friend_confirmed',
          'sum_foundation','sum_withdraw','sum_bonus',
          'loaylty_status'];
      //все параметры разбить на части
      $referrer = ['ref_total', 'sum_from_ref_pending', 'sum_from_ref_confirmed'];
      $cash = ['cnt_pending', 'sum_pending','cnt_confirmed','sum_confirmed','cnt_declined','sum_declined','sum_to_friend_pending','sum_to_friend_confirmed'];
      $foundation = ['sum_foundation'];
      $bonus = ['sum_bonus'];
      $withdraw = ['sum_withdraw'];
      $loyalty = ['loyalty_status'];//??

      $params = !empty($params) ? $params : $allParams;
      $set = [];
      $sql = 'UPDATE ' . self::tableName() . ' u1 ';

      $setParams = array_intersect($referrer, $params);
      if (!empty($setParams)) {
          $sql .= " LEFT JOIN (
          SELECT COUNT(uid) as ref_total, referrer_id,
            SUM(sum_to_friend_pending) as sum_from_ref_pending,
            SUM(sum_to_friend_confirmed) as sum_from_ref_confirmed
            FROM cw_users
            GROUP BY referrer_id
        ) u2 on u2.referrer_id=u1.uid ";
          foreach ($setParams as $setParam) {
              $set[] = ' u1.' . $setParam . '=u2.' . $setParam;
          }
      }
      $setParams = array_intersect($cash, $params);
      if (!empty($setParams)) {
          $sql.=" LEFT JOIN (
          SELECT  user_id,
                SUM(IF(status=0,1,0)) as cnt_pending,
                SUM(IF(status=0,cashback,0)) as sum_pending,
                SUM(IF(status=2,1,0)) as cnt_confirmed,
                SUM(IF(status=2,cashback,0)) as sum_confirmed,
                SUM(IF(status=1,1,0)) as cnt_declined,
                SUM(IF(status=1,cashback,0)) as sum_declined,
                SUM(IF(status=0,ref_bonus,0)) as sum_to_friend_pending,
                SUM(IF(status=2 ,ref_bonus,0)) as sum_to_friend_confirmed
            from cw_payments
            GROUP BY user_id
        )cwp on u1.uid = cwp.user_id ";
          foreach ($setParams as $setParam) {
              $set[] = ' u1.' . $setParam . '=cwp.' . $setParam;
          }
      }
      $setParams = array_intersect($foundation, $params);
      if (!empty($setParams)) {
          $sql.= " 
          LEFT JOIN (
            SELECT SUM(amount) as sum_foundation,user_id
                FROM cw_charity
                WHERE is_listed!=1
                GROUP BY user_id
            ) cwf on cwf.user_id=u1.uid";
          foreach ($setParams as $setParam) {
              $set[] = ' u1.' . $setParam . '=cwf.' . $setParam;
          }
      }

      $setParams = array_intersect($bonus, $params);
      if (!empty($setParams)) {
          $sql.= " 
          LEFT JOIN (
            SELECT SUM(amount) as sum_bonus,user_id
                FROM cw_users_notification
                WHERE type_id=2
                GROUP BY user_id
            ) cwn on cwn.user_id=u1.uid";
          foreach ($setParams as $setParam) {
              $set[] = ' u1.' . $setParam . '=cwn.' . $setParam;
          }
      }
      $setParams = array_intersect($withdraw, $params);
      if (!empty($setParams)) {
          $sql.= " 
          LEFT JOIN (
            SELECT SUM(amount) as sum_withdraw,user_id
                FROM cw_users_withdraw
                WHERE status=2
                GROUP BY user_id
            ) w on w.user_id=u1.uid ";
          foreach ($setParams as $setParam) {
              $set[] = ' u1.' . $setParam . '=w.' . $setParam;
          }
      }


      $sql .= "\n set ".implode(",\n", $set);
      if ($where) {
        $selectParams = [];
        foreach ($where as $key=>$value) {
            $selectParams[] = 'u1.'.$key.'="'.$value.'"';
        }
        $sql .= "\n where ".implode("\n and ", $selectParams);
      }
      //ddd($sql);
      //Yii::$app->db->createCommand($sql)->execute();

  }


  public function getIsBuyStatus(){
    if(empty($this->new_loyalty_status_end) || $this->new_loyalty_status_end<time())return false;
    $isBuy=Notifications::find()
      ->where(['and',
        'user_id='.$this->uid,
        'type_id=4',
        'STR_TO_DATE(JSON_EXTRACT(text,\'$.date\'), \'"%d.%m.%Y"\')>NOW()'
      ])->one();
    return $isBuy?true:false;
  }
}
