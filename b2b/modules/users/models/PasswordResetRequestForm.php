<?php

namespace b2b\modules\users\models;

use Yii;
use yii\base\Model;
use b2b\modules\users\models\B2bUsers;
/**
 * Password reset request form
 */
class PasswordResetRequestForm extends Model
{
  public $email;
  /**
   * @inheritdoc
   */
  public function rules()
  {
    return [
      ['email', 'trim'],
      ['email', 'required'],
      ['email', 'email'],
      ['email', 'exist',
        'targetClass' => 'b2b\modules\users\models\B2bUsers',
        'filter' => [],
        'message' => 'Нет пользователя с таким Email.'
      ],
    ];
  }
  /**
   * Sends an email with a link, for resetting the password.
   *
   * @return bool whether the email was send
   */
  public function sendEmail()
  {
    /* @var $user User */
    $user = B2bUsers::findOne([
      'email' => $this->email,
    ]);
    if (!$user) {
      return false;
    }

    if (!B2bUsers::isPasswordResetTokenValid($user->password_reset_token)) {
      $user->generatePasswordResetToken();
      if (!$user->save()) {
        return false;
      }
    }

    return Yii::$app
      ->mailer
      ->compose(
        ['html' => 'passwordResetToken-html', 'text' => 'b2b-passwordResetToken-text'],
        ['user' => $user]
      )
      ->setFrom([Yii::$app->params['adminEmail'] => Yii::$app->params['adminName'] . ' robot'])
      //->setFrom([Yii::$app->params['supportEmail'] => Yii::$app->name . ' robot'])
      ->setTo($this->email)
      ->setSubject('Восстановление пароля для SecredDiscounter B2B')
      ->send();
  }
}