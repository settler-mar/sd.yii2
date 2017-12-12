<?php
namespace frontend\modules\users\models;

use yii\base\Model;
use yii\base\InvalidParamException;
use frontend\modules\users\models\Users;
use Yii;
use Yii\helpers\Url;

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
        throw new InvalidParamException(Yii::t('account', 'email_confirm_token_empty'));
      }
      $this->_user = Users::findOne(['email_verify_token' => $token, 'email' => $email]);
      if (!$this->_user ) {
        Yii::$app->session->addFlash('err', [
          'title'=>Yii::t('common', 'error').'!',
          'message'=>Yii::t('account', 'email_confirm_token_used_or_expired')
        ]);
        Yii::$app->response->redirect('/');
        return null;
      }
      if ($this->_user->email_verify_time == null || time() - strtotime($this->_user->email_verify_time) > 60*60*24) {
        Yii::$app->session->addFlash('err', [
          'title'=>Yii::t('account', 'error').'!',
          'message'=>Yii::t('account', 'email_confirm_token_expired'),
        ]);
        Yii::$app->response->redirect('/account/sendverifyemail');
        return null;
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
      static::sentEmailValidation($user, ['validate_success' => true]);
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
  //public static function sentEmailValidation($user, $newUser = false, $validateSuccess = false, $path = false)
  public static function sentEmailValidation($user, $options = [])
  {

    $newUser = !empty($options['new_user']) ? $options['new_user'] : false;
    $validateSuccess = !empty($options['validate_success']) ? $options['validate_success'] : false;
    $path = !empty($options['path']) ? $options['path'] : false;

    $templateName = 'verifyEmailToken';
    $subject = Yii::t('account', 'email_confirm_email_subject_confirm');
    if ($newUser) {
      $templateName = 'verifyEmailTokenNewUser';
      $subject = Yii::t('account', 'email_confirm_email_subject_activate');
    }
    if ($validateSuccess) {
      $templateName = 'verifyEmailSuccess';
      $subject = Yii::t('account', 'email_confirm_email_subject_how_to_save');
    }
    $sessionVar = 'sd_verify_mail_time_'.$user->email;
    $lastMailTime = Yii::$app->session->get($sessionVar, false);

    if (!$newUser && !$validateSuccess && $lastMailTime && (time() - $lastMailTime < 60*5)) {
      Yii::$app->session->addFlash('err', [
        'title'=>Yii::t('common', 'error').'!',
        'message'=>Yii::t('account', 'email_confirm_email_wait')
      ]);
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
        ['user' => $user, 'path' => $path]
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
  //public static function validateEmail($id, $path = false)
  public static function validateEmail($user, $path = false)
  {
    //$user = Users::findOne(['uid' => $id]);
    if ($user) {
      $user->email_verify_token = Yii::$app->security->generateRandomString() . '_' . time();
      $user->email_verify_time = date('Y-m-d H:i:s');
      if (self::sentEmailValidation($user, ['path' => $path])) {
        $user->save();
        return true;
      }
    }
    return false;
  }

  /**
   * сообщения юсеру о состоянии его email
   * @param $user
   * @param $path на какую страницу редирект
   */
  public static function emailStatusInfo($user, $path = false)
  {
    if (empty($user->email_verified) && empty($user->email_verify_token)) {
      //если не валидирован и не отправлено письмо, то сразу отправить
      self::validateEmail($user);
    }
    if ($user->email_verify_token != null) {
      Yii::$app->session->addFlash(null, Yii::t('account', 'email_confirm_email_sent'));
    } elseif (empty($user->email_verified)){
      Yii::$app->session->addFlash(
        null,
        Yii::t('account', 'email_confirm_not_confirmed') . '<br><a href="/account/sendverifyemail' .
            ($path ? '?path=' . $path : '') . '">'.Yii::t('common','confirm').'</a> E-mail<br><a href="/account/settings">'.Yii::t('common','change').'</a> E-mail'
      );
    }
  }


}
