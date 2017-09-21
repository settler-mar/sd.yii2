<?php

namespace b2b\modules\users\models;

use yii\base\Model;
use yii\base\InvalidParamException;
use b2b\modules\users\models\B2bUsers;
/**
 * Password reset form
 */
class ResetPasswordForm extends Model
{
  public $password;
  public $password_confirm;
  /**
   * @var \common\models\User
   */
  private $_user;
  /**
   * Creates a form model given a token.
   *
   * @param string $token
   * @param array $config name-value pairs that will be used to initialize the object properties
   * @throws \yii\base\InvalidParamException if token is empty or not valid
   */
  public function __construct($token, $config = [])
  {
    if (empty($token) || !is_string($token)) {
      throw new InvalidParamException('Password reset token cannot be blank.');
    }
    $this->_user = B2bUsers::findByPasswordResetToken($token);
    if (!$this->_user) {
      throw new InvalidParamException('Wrong password reset token.');
    }
    parent::__construct($config);
  }
  /**
   * @inheritdoc
   */
  public function rules()
  {
    return [
      [['password', 'password_confirm'], 'required'],
      ['password', 'string', 'min' => 6],
      ['password_confirm', 'compare', 'compareAttribute' => 'password'],
    ];
  }
  public function attributeLabels()
  {
    return [
      'password' => 'Пароль',
      'password_confirm' => 'Подтверждение пароля',
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
    $user->removePasswordResetToken();
    return $user->save(false);
  }
}