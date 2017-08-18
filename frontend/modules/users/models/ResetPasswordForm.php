<?php
namespace frontend\modules\users\models;

use yii\base\Model;
use yii\base\InvalidParamException;
use app\modules\users\models\Users;
use Yii;

/**
 * Password reset form
 */
class ResetPasswordForm extends Model
{
  public $password;

  public $email;

  private $_user;

  /**
   * Creates a form model given a token.
   *
   * @param string $token
   * @param array $config name-value pairs that will be used to initialize the object properties
   * @throws \yii\base\InvalidParamException if token is empty or not valid
   */
  public function __construct($token = false, $password = false, $config = [])
  {
    if ($token !== false) {
      if (empty($token) || !is_string($token)) {
        throw new InvalidParamException('Идентификатор сброса пароля не может быть пустым.');
      }
      $this->_user = Users::findByPasswordResetToken($token);
      if (!$this->_user) {
        throw new InvalidParamException('Неверный ключ сброса пароля.');
      }
      $this->password=$password;
    }
    parent::__construct($config);
  }

  /**
   * @inheritdoc
   */
  public function rules()
  {
    return [
      ['email', 'trim'],
      [['email', 'password'], 'required'],
      [['email'], 'email'],

      ['password', 'trim'],
      [['password'], 'string', 'max' => 60],
      [['password'], 'string', 'min' => 6],
    ];
  }

  /**
   * Resets password.
   *
   * @return bool if password was reset.
   */
  public function resetPassword()
  {
    $user = $this->_user;
    $user->setPassword($this->password);
    //$user->removePasswordResetToken();

    if ($user->save()){
      return $user->uid;
    }else{
      return false;
    };
  }

  /**
   * Sends an email with a link, for resetting the password.
   *
   * @return bool whether the email was send
   */
  public function sendEmail()
  {
    /* @var $user User */
    $user = Users::findByEmail($this->email);

    if (!$user) {
      $this->addError('email', 'Пользователь с таким e-mail не зарегистрирован.');
      return false;
    }


    $user->generatePasswordResetToken();
    if (!$user->save()) {
      $this->addError('email', 'Ошибка обновления данных. Попробуйте позже.');
      return false;
    }


    $user->password=$this->password;

    return Yii::$app
      ->mailer
      ->compose(
        ['html' => 'passwordResetToken-html', 'text' => 'passwordResetToken-text'],
        ['user' => $user]
      )
      ->setFrom([Yii::$app->params['supportEmail'] => Yii::$app->params['supportEmail']])
      ->setTo($this->email)
      ->setSubject('Сброс пароля на сайте ' . Yii::$app->name)
      ->send();
  }
}
