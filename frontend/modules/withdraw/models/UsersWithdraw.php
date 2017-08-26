<?php

namespace frontend\modules\withdraw\models;

use frontend\modules\users\models\Users;
use Yii;

/**
 * This is the model class for table "cw_users_withdraw".
 *
 * @property integer $uid
 * @property integer $user_id
 * @property integer $process_id
 * @property string $bill
 * @property double $amount
 * @property integer $status
 * @property string $request_date
 * @property string $user_comment
 * @property string $admin_comment
 */
class UsersWithdraw extends \yii\db\ActiveRecord
{
  /**
   * @inheritdoc
   */
  public static function tableName()
  {
    return 'cw_users_withdraw';
  }

  /**
   * @inheritdoc
   */
  public function rules()
  {
    return [
      [['user_id', 'process_id', 'bill', 'request_date'], 'required'],
      [['user_id', 'process_id', 'status'], 'integer'],
      [['amount'], 'number'],
      [['request_date'], 'safe'],
      [['user_comment', 'admin_comment'], 'string'],
      [['bill'], 'string', 'max' => 255],
    ];
  }

  /**
   * @inheritdoc
   */
  public function attributeLabels()
  {
    return [
      'uid' => 'ID',
      'user_id' => 'Пользователь',
      'process_id' => 'Тип',
      'bill' => 'Номер',
      'amount' => 'Сумма',
      'status' => 'Статус',
      'request_date' => 'Дата запроса',
      'user_comment' => 'Комментарий пользователя',
      'admin_comment' => 'Комментарий админа',
    ];
  }

  public function beforeValidate()
  {
    if (!parent::beforeValidate()) {
      return false;
    }

    if ($this->isNewRecord) {
      $this->user_id = Yii::$app->user->id;
      $this->request_date = date('Y-m-d H:i:s');
    }
    return true;
  }

  public function getUser()
  {
    $user=Users::findOne(['uid'=>$this->user_id]);
    return $user;
  }

  public function getProcess_name(){
    $pr=WithdrawProcess::findOne(['uid'=>$this->process_id]);
    return $pr->name;
  }
}
