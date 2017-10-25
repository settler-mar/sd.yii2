<?php

namespace b2b\modules\users\models;

use Yii;
use yii\base\Model;
/**
 * LoginForm is the model behind the login form.
 *
 * @property User|null $user This property is read-only.
 *
 */
class LoginForm extends Model
{
  public $email;
  public $password;
  public $rememberMe = true;
  
  private $user = false;

  public function attributeLabels()
  {
    return [
      'email' => 'Email',
      'passwors' => 'Пароль',
      'rememberMe' => 'Запомнить',
    ];
  }
  /**
   * @return array the validation rules.
   */
  public function rules()
  {
    return [
      [['email', 'password'], 'required'],
      ['rememberMe', 'boolean'],
      ['password', 'validatePassword'],
    ];
  }
  /**
   * Validates the password.
   * This method serves as the inline validation for password.
   *
   * @param string $attribute the attribute currently being validated
   * @param array $params the additional name-value pairs given in the rule
   */
  public function validatePassword($attribute, $params)
  {
    if (!$this->hasErrors()) {
      $user = $this->getUser();
      if (!$user || !$user->validatePassword($this->password)) {
        $this->addError($attribute, 'Неверное имя пользователя или пароль.');
      }
    }
  }
  /**
   * Logs in a user using the provided email and password.
   * @return boolean whether the user is logged in successfully
   */
  public function login()
  {
    if ($this->validate()) {
      $this->getUser();
      if ($this->user->is_active != 2) {
        Yii::$app->session->addFlash(
          'err',
          $this->user->is_active == 0 ? 'Ваша заявка на рассмотрении.' :
            ($this->user->is_active == 1 ? 'Ваш пользователь не активен, обратитесь к администратору.' :
              'Ошибка входа в систему, обратитесь к администратору.')
        );
        return false;
      }
      return Yii::$app->user->login($this->user, $this->rememberMe ? 3600*24*30 : 0);
    }
    return false;
  }
  /**
   * Finds user by email
   *
   * @return User|null
   */
  public function getUser()
  {
    if ($this->user === false) {
      $this->user = B2bUsers::findByEmail($this->email);
    }
    return $this->user;
  }

  public function loginByKey($key){
    if ($this->user === false) {
      $this->user = B2bUsers::find()
      ->where(['temp_key'=>$key])
      ->one();
    }
    if ($this->user){
      return Yii::$app->user->login($this->getUser(), $this->rememberMe ? 3600*24*30 : 0);
    };
    return false;
  }
}