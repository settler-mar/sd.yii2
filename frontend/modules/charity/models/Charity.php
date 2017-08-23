<?php

namespace frontend\modules\charity\models;

use Yii;

/**
 * This is the model class for table "cw_charity".
 *
 * @property integer $uid
 * @property integer $user_id
 * @property integer $foundation_id
 * @property double $amount
 * @property string $added
 * @property string $note
 * @property integer $is_showed
 * @property integer $is_listed
 */
class Charity extends \yii\db\ActiveRecord
{
  /**
   * @inheritdoc
   */
  public static function tableName()
  {
    return 'cw_charity';
  }

  /**
   * @inheritdoc
   */
  public function rules()
  {
    return [
      [['user_id', 'foundation_id', 'amount', 'added'], 'required'],
      [['user_id', 'foundation_id', 'is_showed', 'is_listed'], 'integer'],
      [['amount'], 'number'],
      [['added'], 'safe'],
      [['note'], 'string', 'max' => 255],
    ];
  }

  /**
   * @inheritdoc
   */
  public function attributeLabels()
  {
    return [
      'uid' => 'Uid',
      'user_id' => 'User ID',
      'foundation_id' => 'Foundation ID',
      'amount' => 'Amount',
      'added' => 'Added',
      'note' => 'Note',
      'is_showed' => 'Is Showed',
      'is_listed' => 'Is Listed',
    ];
  }

  public function beforeValidate()
  {
    if (!parent::beforeValidate()) {
      return false;
    }

    if ($this->isNewRecord) {
      $this->user_id = Yii::$app->user->id;
      $this->added = date('Y-m-d H:i:s');
    }
    return true;
  }
}
