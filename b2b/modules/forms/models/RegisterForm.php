<?php

namespace b2b\modules\forms\models;

use Yii;
use yii\base\Model;


class RegisterForm extends Model
{

  public $subject, $text, $email, $name, $phone, $offline;
  public $reCaptcha;
  /**
   * @inheritdoc
   */
  public function rules()
  {
    return [
      [['subject', 'text', 'reCaptcha', 'name', 'email'], 'required'],
      [['subject', 'name'], 'string', 'max' => 256],
      [['text'], 'string'],
      [['email'], 'email'],
      [['phone'], 'number'],
      [['offline'], 'safe'],
      [['reCaptcha'], \himiklab\yii2\recaptcha\ReCaptchaValidator::className(),'uncheckedMessage'=>" "]
    ];
  }

  /**
   * @inheritdoc
   */
  public function attributeLabels()
  {
    return [
      'name'=>"Ваше имя",
      'email'=>"Email",
      'phone'=>"Телефон",
      'text'=>"Сообщение",
      'reCaptcha'=>"Я не робот",
    ];
  }

}