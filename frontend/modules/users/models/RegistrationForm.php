<?php

namespace frontend\modules\users\models;

use Yii;
use yii\base\Model;
use frontend\modules\users\models\Users;
use frontend\modules\users\models\ValidateEmail;
use common\components\DomainValidator;

class RegistrationForm extends Model
{
  public $email;
  public $password;
  public $password_repeat;

  /**
   * @inheritdoc
   */
  public function rules()
  {
    return [
      ['email', 'trim'],
      [['email', ], 'required', 'message' => Yii::t('account', 'email_is_required')],
      [['password', ], 'required', 'message' => Yii::t('account', 'password_is_required')],
      [['password_repeat'], 'required', 'message' => Yii::t('account', 'password_repeat_is_required')],
      [['email'], 'email'],
      ['password_repeat', 'compare', 'compareAttribute' => 'password', 'message' => Yii::t('account', 'password_not_same_with_password_repeat'), 'operator' => '=='],
      ['email', 'unique', 'targetClass' => 'frontend\modules\users\models\Users', 'message' => Yii::t('account', 'user_width_this_email_exists')],
      ['email', DomainValidator::className()],
      [['password'], 'trim'],
      [['password'], 'string', 'max' => 60],
      [['password'], 'string', 'min' => 6],
    ];
  }

  public function attributeLabels()
  {
    return [
      'email' => 'Email',
      'password' => Yii::t('common', 'password'),
      'password_repeat' => Yii::t('common', 'password_repeat'),
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