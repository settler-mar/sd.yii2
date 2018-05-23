<?php

namespace frontend\modules\support\models;

use Yii;
use yii\base\Model;

class Support extends Model
{
    public $title;
    public $message;
    public $reCaptcha;

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['title', 'message'], 'trim'],
            [['title',], 'required', 'message' => 'Необходимо ввести ваш тему'],
            [['message',], 'required', 'message' => 'Необходимо ввести текст обращения'],
            [['reCaptcha'], \himiklab\yii2\recaptcha\ReCaptchaValidator::className(), 'uncheckedMessage' => " "]
        ];
    }

    public function attributeLabels()
    {
        return [
            'title' => 'Тема письма',
            'message' => 'Текст обращения',
            'reCaptcha' => 'Докажите, что вы не робот',
        ];
    }
}