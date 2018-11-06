<?php

namespace frontend\modules\charity\models;

use yii;
use frontend\modules\cache\models\Cache;
use frontend\modules\users\models\Users;
use frontend\modules\funds\models\Foundations;

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
  const SCENARIO_ACCOUNT = 'account';

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
      [['user_id', 'foundation_id', 'added'], 'required'],
      [['foundation_id'], 'required', 'message'=> Yii::t('account', 'dobro_fund_required')],
      [['foundation_id'], 'exist', 'targetClass' => Foundations::className(), 'targetAttribute'=>'uid', 'filter'=>['is_active' => 1]],
      ['amount', 'required', 'message' => Yii::t('account', 'dobro_summ_required')],
      [['user_id', 'foundation_id', 'is_showed', 'is_listed'], 'integer'],
      [['amount'], 'number', 'min'=>1],
      [['amount'], 'filter', 'on' => 'account',  'filter' => function ($value) {
          $maxAmount = Yii::$app->user->identity->balance['max_fundation'];
          if ($value > $maxAmount) {
              $this->addError(
                  'amount',
                  Yii::t('account','dobro_max_summ') . ' ' .
                  number_format($maxAmount,2,'.',' ') . ' '.
                  Yii::$app->user->identity->currency
              );
          }
          return $value;
      }],
      [['added'], 'safe'],
      [['note'], 'string', 'max' => 255],
      [['note'], 'trim'],
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
      'foundation_id' => 'Фонд',
      'amount' => 'Сумма',
      'added' => 'Дата',
      'note' => 'Note',
      'is_showed' => 'Is Showed',
      'is_listed' => 'Статус',
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

  public function getUser()
  {
    return $this->hasOne(Users::className(), ['uid' => 'user_id']);
  }
  public function getFoundation()
  {
    return $this->hasOne(Foundations::className(), ['uid' => 'foundation_id']);
  }

  public function afterSave($insert, $changedAttributes)
  {
    Cache::clearName('account_charity' . $this->user_id);
  }
  public function afterDelete()
  {
    Cache::clearName('account_charity' . $this->user_id);
  }

  public static function waitingCount($userId = null)
  {
      $count = self::find()->where(['is_listed' => 0]);
      if ($userId) {
        $count = $count->andWhere(['user_id' => $userId]);
      }
      return $count->count();
  }
}
