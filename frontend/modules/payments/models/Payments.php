<?php

namespace frontend\modules\payments\models;

use frontend\modules\stores\models\SpaLink;
use frontend\modules\stores\models\Stores;
use Yii;

/**
 * This is the model class for table "cw_payments".
 *
 * @property integer $uid
 * @property integer $is_showed
 * @property integer $action_id
 * @property integer $affiliate_id
 * @property integer $user_id
 * @property double $order_price
 * @property double $reward
 * @property double $cashback
 * @property integer $status
 * @property string $click_date
 * @property string $action_date
 * @property string $status_updated
 * @property string $closing_date
 * @property integer $spa_id
 * @property integer $additional_id
 * @property integer $ref_bonus_id
 * @property double $ref_bonus
 * @property integer $ref_id
 * @property integer $loyalty_status
 * @property string $order_id
 * @property integer $shop_percent
 */
class Payments extends \yii\db\ActiveRecord
{
  /**
   * @inheritdoc
   */
  public static function tableName()
  {
    return 'cw_payments';
  }

  /**
   * @inheritdoc
   */
  public function rules()
  {
    return [
      [['is_showed', 'action_id', 'affiliate_id', 'user_id', 'status', 'spa_id', 'additional_id', 'ref_bonus_id', 'ref_id', 'loyalty_status', 'shop_percent'], 'integer'],
      [['action_id', 'affiliate_id', 'user_id', 'click_date', 'action_date', 'status_updated', 'closing_date'], 'required'],
      [['order_price', 'reward', 'cashback', 'ref_bonus', 'kurs'], 'number'],
      [['click_date', 'action_date', 'status_updated', 'closing_date'], 'safe'],
      [['order_id'], 'string', 'max' => 50],
    ];
  }

  /**
   * @inheritdoc
   */
  public function attributeLabels()
  {
    return [
      'uid' => 'Uid',
      'is_showed' => 'Is Showed',
      'action_id' => 'Action ID',
      'affiliate_id' => 'Affiliate ID',
      'user_id' => 'User ID',
      'order_price' => 'Order Price',
      'reward' => 'Reward',
      'cashback' => 'Cashback',
      'status' => 'Status',
      'click_date' => 'Click Date',
      'action_date' => 'Action Date',
      'status_updated' => 'Status Updated',
      'closing_date' => 'Closing Date',
      'spa_id' => 'Spa ID',
      'additional_id' => 'Additional ID',
      'ref_bonus_id' => 'Ref Bonus ID',
      'ref_bonus' => 'Ref Bonus',
      'ref_id' => 'Ref ID',
      'loyalty_status' => 'Loyalty Status',
      'order_id' => 'Order ID',
      'shop_percent' => 'Shop Percent',
      'kurs' => 'kurs',
    ];
  }

  /**
   * магазин купона
   * @return \yii\db\ActiveQuery
   */
  public function getStore()
  {
    $cpa=SpaLink::findOne(['spa_id'=>1,'affiliate_id'=>$this->affiliate_id]);
    return $cpa->store;
  }
}
