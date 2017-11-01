<?php

namespace b2b\modules\forms\models;

use Yii;
use yii\base\Model;


class Regform extends Model
{

  public $firm,$url,$category,$region,$type,$old,$points,$fio,$position,$email,$phone,$password,$repassword;
  public $reCaptcha;
  /**
   * @inheritdoc
   */
  public function rules()
  {
    return [
      [
        ['firm','category','region','type','old','points','fio','position','email','phone','password','repassword'],
        'required',
        'message' => 'Это поле обязательно для заполнения.'
      ],
      [['email'], 'email','message' => 'Введеное значение не является правильным email адресом.'],
      [['firm','category','region','type','old','points','fio','position','email','phone','password','repassword','url'], 'trim'],
      [['url'], 'safe'],
      [['password','repassword'], 'string', 'max' => 60],
      [['password','repassword'], 'string', 'min' => 6],
      ['repassword',
        'compare',
        'compareAttribute' => 'password',
        'message' => 'Введенные пароли не совпадают.'
      ],
      [['reCaptcha'], \himiklab\yii2\recaptcha\ReCaptchaValidator::className(),'uncheckedMessage'=>" "]
    ];
  }

  /**
   * @inheritdoc
   */
  public function attributeLabels()
  {
    return [
      'firm' => 'Название компании',
      'category' => 'Сфера деятельности компании',
      'region' => 'Регион ведения бизнеса',
      'type' => 'Форма собственности компании',
      'old' => 'Сколько лет на рынке',
      'points' => 'Количество торговых точек',
      'fio' => 'Ф.И.О. контактного лица',
      'position' => 'Должность контактного лица',
      'email' => 'E-mail (будет использоваться для автоматических оповещений)',
      'phone' => 'Телефон контактного лица',
      'password' => 'Пароль',
      'repassword' => 'Повтор пароля',
      'url' => 'Ссылка на сайт интернет-магазина (если есть) или сайт компании',
      'reCaptcha' => 'Введите код с картинки',
    ];
  }



}