<?php
namespace frontend\modules\users\models;

use yii\base\Model;
use yii\base\InvalidParamException;
use frontend\modules\users\models\Users;
use Yii;
use yii\db\ActiveRecord;
/**
 * Password reset form
 */
//class SetPasswordForm extends UserSetting
class SetPasswordForm extends activeRecord
{

    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cw_users';
    }

    public $old_password;
    public $new_password;
    public $r_new_password;
    public $password_change;
  /**
   * @inheritdoc
   */
  public function rules()
  {
    return [
        [['old_password', 'new_password', 'r_new_password'], 'required'],

        ['old_password', 'validatePassword'],

        ['old_password', 'trim'],
        [['old_password'], 'string', 'max' => 60],
        [['old_password'], 'string', 'min' => 6],

        ['new_password', 'trim'],
        [['new_password'], 'string', 'max' => 60],
        [['new_password'], 'string', 'min' => 6],

        ['r_new_password', 'trim'],
        [['r_new_password'], 'string', 'max' => 60],
        [['r_new_password'], 'string', 'min' => 6],
        [['password_change'], 'safe'],

       // ['r_new_password', 'compare', 'compareAttribute' => 'new_password','message'=>Yii::t('account','password_not_compare')],


        ['r_new_password',
            'compare',
            'compareAttribute' => 'new_password',
            'message' => Yii::t('account', 'save_settings_password_repeat_not_same')
        ],
    ];
  }

    public function attributeLabels()
    {
        return [
            'old_password' => Yii::t('account', 'password_old'),
            'new_password' => Yii::t('account', 'password_new'),
            'r_new_password' => Yii::t('account', 'password_repeat2'),
        ];
    }

  public function validatePassword($param_name)
  {
    $old = $this->getOldAttributes();
    $password = $old['password'];
    if (!Yii::$app->security->validatePassword($this->old_password, $password)) {
        $this->addError('old_password', Yii::t('account', 'save_settings_old_password_fail'));
    } else {
        $this->password = Yii::$app->security->generatePasswordHash($this->new_password);
        Yii::$app->session->addFlash('info', Yii::t('account', 'save_settings_password_changed_to') . ' <b>' . $this->new_password . '</b>');
    }

  }
}
