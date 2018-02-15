<?php
namespace frontend\modules\users\models;

use yii\base\Model;
use yii\base\InvalidParamException;
use frontend\modules\users\models\Users;
use Yii;

/**
 * Password reset form
 */
class SetPasswordForm extends UserSetting
{

  /**
   * @inheritdoc
   */
  public function rules()
  {
    return [
        [['old_password', 'new_password', 'r_new_password'], 'required'],

        ['old_password', 'trim'],
        [['old_password'], 'string', 'max' => 60],
        [['old_password'], 'string', 'min' => 6],

        ['new_password', 'trim'],
        [['new_password'], 'string', 'max' => 60],
        [['new_password'], 'string', 'min' => 6],

        ['r_new_password', 'trim'],
        [['r_new_password'], 'string', 'max' => 60],
        [['r_new_password'], 'string', 'min' => 6],

        ['r_new_password', 'compare', 'compareAttribute' => 'new_password','message'=>Yii::t('account','password_not_compare')],
    ];
  }
}
