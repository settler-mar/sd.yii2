<?php

namespace frontend\modules\dobro\models;

use Yii;

/**
 * This is the model class for table "cw_autopayments".
 *
 * @property integer $uid
 * @property integer $user_id
 * @property integer $foundation_id
 * @property string $added
 */
class Autopayments extends \yii\db\ActiveRecord
{
  /**
   * @inheritdoc
   */
  public static function tableName()
  {
    return 'cw_autopayments';
  }

  /**
   * @inheritdoc
   */
  public function rules()
  {
    return [
      [['user_id', 'foundation_id', 'added'], 'required'],
      [['user_id', 'foundation_id'], 'integer'],
      [['added'], 'safe'],
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
      'added' => 'Added',
    ];
  }

  public function beforeValidate()
  {
    if (!parent::beforeValidate()) {
      return false;
    }

    if ($this->isNewRecord) {
      if (!isset($this->user_id) || $this->user_id == 0) {
        $this->user_id = Yii::$app->user->id;
      }
      $this->added = date('Y-m-d H:i:s');
    }

    return true;
  }

  public function getFond()
  {
    return Foundations::findOne(['uid' => $this->foundation_id]);
  }
}
