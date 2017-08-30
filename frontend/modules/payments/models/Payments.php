<?php

namespace frontend\modules\payments\models;

use frontend\modules\stores\models\CpaLink;
use frontend\modules\stores\models\Stores;
use frontend\modules\users\models\Users;
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
 * @property integer $cpa_id
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
      [['is_showed', 'action_id', 'affiliate_id', 'user_id', 'status', 'cpa_id', 'additional_id', 'ref_bonus_id', 'ref_id', 'loyalty_status', 'shop_percent'], 'integer'],
      [['action_id', 'affiliate_id', 'user_id', 'click_date', 'action_date', 'status_updated', 'closing_date'], 'required'],
      [['order_price', 'reward', 'cashback', 'ref_bonus', 'kurs'], 'number'],
      [['click_date', 'action_date', 'status_updated', 'closing_date','storeName','email'], 'safe'],
      [['order_id'], 'string', 'max' => 50],
    ];
  }

  /**
   * @inheritdoc
   */
  public function attributeLabels()
  {
    return [
      'uid' => 'ID',
      'is_showed' => 'Is Showed',
      'action_id' => 'Код действия',
      'affiliate_id' => 'Affiliate ID',
      'user_id' => 'Пользователь',
      'order_price' => 'Order Price',
      'reward' => 'Вознаграждение',
      'cashback' => 'Cashback',
      'status' => 'Статус',
      'click_date' => 'Click Date',
      'action_date' => 'Action Date',
      'status_updated' => 'Status Updated',
      'closing_date' => 'Closing Date',
      'cpa_id' => 'Spa ID',
      'additional_id' => 'Additional ID',
      'ref_bonus_id' => 'Ref Bonus ID',
      'ref_bonus' => 'Кэшбэк бонус',
      'ref_id' => 'Ref ID',
      'loyalty_status' => 'Loyalty Status',
      'order_id' => 'Order ID',
      'shop_percent' => 'Shop Percent',
      'kurs' => 'kurs',
      'storeName' => 'Название магазина',
    ];
  }

  /**
   * магазин купона
   * @return \yii\db\ActiveQuery
   */
  public function getCpaLink()
  {
    return $this->hasOne(CpaLink::className(), ['affiliate_id' => 'affiliate_id','cpa_id' => 'cpa_id']);
  }

  public function getStore()
  {
    return $this->hasOne(Stores::className(), ['uid' => 'stores_id'])
      ->via('cpaLink');
  }

  public function getStoreName(){
    return $this->store->name;
    //'<a href="/admin/stores/update?id='.$this->store->uid.'">'.$this->store->name.'</a>';
  }

  public function getStringStatus()
  {
    return Yii::$app->help->colorStatus($this->status);
  }

  public function getShowedString(){
      if ($this->status == 0) return 'Скрыт';
      if ($this->status == 1) return 'Отображен';
  }

  public function getEmail(){
    return $this->user->email;
    //return '<a href="/admin/users/update?id='.$this->user->uid.'">'.$this->user->email.'('.$this->user->uid.')</a>';
  }

 // public function getCpaLink()
 // {
 //   return $this->hasMany(CpaLink::className(), ['spa_id' => 'cpa_id']);
 // }

  public function getUser()
  {
    return $this->hasOne(Users::className(), ['uid' => 'user_id']);
  }
}
