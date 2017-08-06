<?php

namespace app\modules\users\models;

use Yii;
use yii\base\Model;
use app\modules\users\models\Users;

class RegistrationForm extends Model
{
  public $email;
  public $password;

  /**
   * @inheritdoc
   */
  public function rules()
  {
    return [
      ['email', 'trim'],
      [['email', 'password'], 'required'],
      [['email'], 'email'],
      ['email', 'unique', 'targetClass' => 'app\modules\users\models\Users', 'message' => 'Пользователь с таким email уже зарегистрирован.'],

      ['password', 'trim'],
      [['password'], 'string', 'max' => 60],
      [['password'], 'string', 'min' => 6],
    ];
  }

  /**
   * Signs user up.
   *
   * @return User|null the saved model or null if saving fails
   */
  public function signup()
  {
    if (!$this->validate()) {
      return null;
    }

    $user = new Users();
    $user->email = $this->email;
    $user->setPassword($this->password);
    $user->generateAuthKey();

    return $user->save() ? $user : null;
  }
}