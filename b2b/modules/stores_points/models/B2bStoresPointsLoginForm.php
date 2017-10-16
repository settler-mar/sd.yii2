<?php

namespace b2b\modules\stores_points\models;

use Yii;
use yii\base\Model;


/**
 * LoginForm is the model behind the login form.
 *
 * @property User|null $user This property is read-only.
 *
 */
class B2bStoresPointsLoginForm extends Model
{
  public static $identity_cookie = '_identity-b2b_stores_point';
  public $login;
  public $password;
  
  private $user = false;
  //private $rememberMe = true;

  public function attributeLabels()
  {
    return [
      'login' => 'Логин',
      'password' => 'Пароль',
    ];
  }
  /**
   * @return array the validation rules.
   */
  public function rules()
  {
    return [
      [['login', 'password'], 'required'],
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
      $point = $this->getUser();
      if (!$point || !$point->validatePassword($this->password)) {
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
      //return Yii::$app->user->login($this->getUser(), $this->rememberMe ? 3600*24*30 : 0);
      $user = $this->getUser();
      if ($user) {
        B2bStoresPoints::writeIdentity($user->id);
        return true;
      } else {
        return false;
      }
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
      $this->user = B2bStoresPoints::byLogin($this->login);
    }
    return $this->user;
  }

  public static function getIdentity()
  {
    $cookies = Yii::$app->request->cookies;
    $token = $cookies->getValue(static::$identity_cookie);
    if (!$token) {
      return false;
    }
    return B2bStoresPoints::findIdentityByAccessToken($token);
  }
}