<?php
namespace frontend\modules\users\models;

use yii\base\Model;
use yii\base\InvalidParamException;
use frontend\modules\users\models\Users;
use Yii;

/**
 * Password reset form
 */
class ValidateEmail extends Model
{

  private $_user;

  /**
   * Creates a form model given a token.
   *
   * @param string $token
   * @param string $email
   * @throws \yii\base\InvalidParamException if token is empty or not valid
   */
  public function __construct($token = false, $email = false)
  {
    if ($token !== false) {
      if (empty($token) || !is_string($token)) {
        throw new InvalidParamException('Идентификатор подтверждения email не может быть пустым.');
      }
      $this->_user = Users::findOne(['email_verify_token' => $token, 'email' => $email]);
      if (!$this->_user ) {
        throw new InvalidParamException('Неверный ключ и email для подтверждения email.');
      }
      if ($this->_user->email_verify_time == null || time() - strtotime($this->_user->email_verify_time) > 60*60*24) {
        throw new InvalidParamException('Ссылка для подтверждения email устарела');
      }
    }
    parent::__construct();
  }

  /**
   * @inheritdoc
   */
  public function rules()
  {
    return [
      ['email', 'trim'],
      [['email', 'token'], 'required'],
      [['email'], 'email'],
      [['token'], 'string'],
    ];
  }

  /**
   * запись в базу о подтверждении
   * @return bool|mixed
   */
  public function verifyEmail()
  {
    $user = $this->_user;

    $user->email_verified = 1;
    $user->email_verify_token = null;
    $user->email_verify_time = null;

    if ($user->save()){
      //отправляем письмо о валидации
      static::sentEmailValidation($user, false, true);
      return $user->uid;
    }else{
      return false;
    }
  }

  /**
   * отправка почты
   * @param $user
   * @return bool
   */
  public static function sentEmailValidation($user, $newUser = false, $validateSuccess = false)
  {
    $templateName = 'verifyEmailToken';
    $subject = 'Подтвердите Email на SecretDiscounter.ru';
    if ($newUser) {
      $templateName = 'verifyEmailTokenNewUser';
      $subject = 'Активируйте аккаунт на SecretDiscounter.ru';
    }
    if ($validateSuccess) {
      $templateName = 'verifyEmailSuccess';
      $subject = 'Узнайте, как экономить до 40% на покупках';
    }
    $sessionVar = 'sd_verify_mail_time';
    $lastMailTime = Yii::$app->session->get($sessionVar, false);

    if (!$newUser && !$validateSuccess && $lastMailTime && (time() - $lastMailTime < 60*30)) {
      Yii::$app->session->addFlash('err', 'Ограничение на отправку сообщений - не больше одного в 30 минут');
      Yii::$app->response->redirect('/account');
      return null;
    }
    Yii::$app->session->set($sessionVar, time());

    return Yii::$app
      ->mailer
      ->compose(
        [
          'html' => $templateName . '-html',
          'text' => $templateName . '-text'],
        ['user' => $user]
      )
      ->setFrom([Yii::$app->params['adminEmail'] => Yii::$app->params['adminName']])
      ->setTo($user->email)
      ->setSubject($subject)
      ->send();
  }

  /**
   * подтверждение email (кнопкой в профиле или во встплывашке, не во время регистрации)
   * @return mixed
   */
  public static function validateEmail($id)
  {
    $user = Users::findOne(['uid' => $id]);
    if ($user) {
      $user->email_verify_token = Yii::$app->security->generateRandomString() . '_' . time();
      $user->email_verify_time = date('Y-m-d H:i:s');
      if (self::sentEmailValidation($user)) {
        $user->save();
        return true;
      }
    }
    return false;
  }

  /**
   * сообщения юсеру о состоянии его email
   * @param $user
   */
  public static function emailStatusInfo($user)
  {
    if ($user->email_verify_token != null) {
      Yii::$app->session->addFlash(null, 'Вам отправлено письмо со ссылкой на подтверждение E-mail. Проверьте вашу почту. Если вы вдруг не получили письмо проверьте папку "СПАМ".');
    } elseif (empty($user->email_verified)){
      Yii::$app->session->addFlash(
        null,
        'Ваш Email не подтверждён.<br><a href="/sendverifyemail">Подтвердить</a> Email<br><a href="/account/settings">Cменить</a> Email'
      );
    }
  }


}
