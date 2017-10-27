<?php

namespace b2b\models;

use Yii;
use yii\base\Model;


class RegisterForm extends Model
{

  public $subject, $text;
  public $reCaptcha;
  /**
   * @inheritdoc
   */
  public function rules()
  {
    return [
      [['subject', 'text', 'reCaptcha'], 'required'],
      [['subject'], 'string', 'max' => 256],
      [['text'], 'string'],
      [['reCaptcha'], \himiklab\yii2\recaptcha\ReCaptchaValidator::className(),'uncheckedMessage'=>" "]
    ];
  }

  /**
   * @inheritdoc
   */
  public function attributeLabels()
  {
    return [
    ];
  }

}