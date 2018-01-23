<?php

namespace frontend\modules\users\models;

use Yii;
use yii\base\Model;
use frontend\modules\users\models\Users;
use frontend\modules\users\models\ValidateEmail;

class RegistrationWebForm extends Model
{
  public $email;
  public $password;
  public $password_repeat;
  public $traffType;
  public $url;

  /**
   * @inheritdoc
   */
  public function rules()
  {
    return [
      [['email','url'], 'trim'],
      [['email', ], 'required', 'message' => 'Необходимо ввести ваш E-mail'],
      [['password', ], 'required', 'message' => 'Необходимо ввести пароль'],
      [['password_repeat'], 'required', 'message' => 'Необходимо повторить пароль'],
      [['email'], 'email'],
      ['password_repeat', 'compare', 'compareAttribute' => 'password', 'message' => 'Введенные пароли не совпадают.', 'operator' => '=='],
      ['email', 'unique', 'targetClass' => 'frontend\modules\users\models\Users', 'message' => 'Пользователь с таким email уже зарегистрирован.'],
      [['password'], 'trim'],
      [['password'], 'string', 'max' => 60],
      [['password'], 'string', 'min' => 6],
      ['url','url','message'=>"Ссылка должна быть в формате https://primer.ru"],
      [['traffType'], 'required', 'message' => 'Необходимо выбрать основной тип трафика'],
      [['url'], 'required', 'message' => 'Необходимо ввести адрес'],
    ];
  }

  public function attributeLabels()
  {
    return [
      'email' => 'Email',
      'password' => 'Пароль',
      'password_repeat' => 'Повтор пароля',
      'url' => 'Ссылка на вашу площадку',
      'traffType' => 'Тип трафика',
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
    $user->url = $this->url;
    $user->traffType = $this->traffType;
    $user->waitModeration = 1;
    $user->setPassword($this->password);
    $user->generateAuthKey();
    
    //пишем токен для валидации почты
    $user->email_verify_token = Yii::$app->security->generateRandomString() . '_' . time();
    $user->email_verify_time = date('Y-m-d H:i:s');

    if ($user->save() && ValidateEmail::sentEmailValidation($user, ['new_user' => true])) {
       return $user;
    } else {
      return null;
    }
  }


}