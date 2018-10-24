<?php

namespace frontend\modules\users\models;

use Yii;
use yii\base\Model;

/**
 * Login form
 */
class LoginForm extends Model
{
    public $email;
    public $password;
    public $rememberMe = true;
    public $reCaptcha;

    private $_user;
    private $attemps;


    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            // username and password are both required
            [['email'], 'trim'],
            [['email', ], 'required', 'message' => Yii::t('account', 'email_is_required')],
            [['password', ], 'required', 'message' => Yii::t('account', 'password_is_required')],
            [['email'], 'email'],
            [['password'], 'string', 'max' => 60],
            [['password'], 'string', 'min' => 5],
            // rememberMe must be a boolean value
            ['rememberMe', 'boolean'],
            // password is validated by validatePassword()
            ['password', 'validatePassword'],
            [['reCaptcha'], \himiklab\yii2\recaptcha\ReCaptchaValidator::className(),'uncheckedMessage'=>" "]
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
            if ($user && $user->is_active == Users::STATUS_DELETED) {
                $this->addError('email', Yii::t('account', 'login_your_account_deleted'));
                return;
            }
            if (!$user || !$user->validatePassword($this->password)) {
                $this->addError($attribute, Yii::t('account', 'password_or_email_is_wrong'));
                if ($this->attemps == Yii::$app->params['login_attemps_count']) {
                    $this->addError(
                        'email',
                        Yii::t(
                            'main',
                            'number_attempts_login_{count}_exceeded_try_in_{interval}_minute',
                            [
                                'count'=>Yii::$app->params['login_attemps_count'],
                                'interval'=>Yii::$app->params['login_attemps_block_period'],
                            ]
                        )
                    );
                }
            }
        }
    }

    public function beforeValidate()
    {
        if (!UserLoginAttemps::attemp()) {
            $this->addError(
                'email',
                Yii::t(
                    'main',
                    'number_attempts_login_{count}_exceeded_try_in_{interval}_minute',
                    [
                        'count'=>Yii::$app->params['login_attemps_count'],
                        'interval'=>Yii::$app->params['login_attemps_block_period'],
                    ]
                )
            );
            return false;
        }
        $this->attemps = UserLoginAttemps::$count;
        return parent::beforeValidate();
    }

    /**
     * Logs in a user using the provided username and password.
     *
     * @return bool whether the user is logged in successfully
     */
    public function login()
    {
        if (
            //$this->beforeValidate() &&
            $this->validate()
        ) {
            UserLoginAttemps::attemp(true);//запись успешного логин
            return Yii::$app->user->login($this->getUser(), 3600 * 24 * 30);
        } else {
            return false;
        }
    }

    /**
     * Finds user by [[username]]
     *
     * @return User|null
     */
    protected function getUser()
    {
        if ($this->_user === null) {
            //$this->_user = Users::findByEmail($this->email);
            $this->_user = Users::findOne(['email' => $this->email]);
        }

        return $this->_user;
    }
}
