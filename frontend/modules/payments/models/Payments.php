<?php

namespace frontend\modules\payments\models;

use frontend\modules\stores\models\CpaLink;
use frontend\modules\stores\models\Stores;
use frontend\modules\users\models\Users;
use yii;
use frontend\modules\cache\models\Cache;
use b2b\modules\stores_points\models\B2bStoresPoints;

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
  public $category;

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
      [['is_showed', 'action_id', 'affiliate_id', 'status', 'cpa_id', 'additional_id', 'ref_bonus_id', 'ref_id', 'loyalty_status', 'shop_percent'], 'integer', 'on' => 'online'],
      [['uid'], 'integer', 'on' => 'offline'],
      [['user_id'], 'integer', 'on' => 'online'],
      [['user_id'], 'match', 'pattern' => '/^SD-\d*$/', 'on' => 'offline', 'message' => 'ID пользователя должно быть в формате SD-xxxxxxxx'],
      [['user_id'], 'filter', 'on' => 'offline', 'filter'=> function ($value) {
        $value = intval(preg_replace('/[^0-9\.]/', '', $value));
        return $value;
      }],
      [['user_id'], 'required'],
      [['action_id', 'affiliate_id', 'click_date', 'action_date', 'status_updated', 'closing_date'], 'required', 'on' => 'online'],
      [['order_price', 'reward', 'cashback', 'ref_bonus', 'kurs'], 'number'],
      [['click_date', 'action_date', 'status_updated', 'closing_date','storeName','email'], 'safe', 'on' => 'online'],
      [['category'], 'safe', 'on' => 'offline'],
      [['order_id'], 'string', 'max' => 50],
      [['admin_comment'], 'string', 'max' => 255, 'on' => 'online'],
    ];
  }

  /**
   * @inheritdoc
   */
  public function attributeLabels()
  {
    return [
      'uid' => 'ID',
      'admin_comment'=>'Коментарий администратора',
      'is_showed' => 'Is Showed',
      'action_id' => 'Код действия',
      'affiliate_id' => 'Affiliate ID',
      'user_id' => 'Пользователь',
      'order_price' => 'Сумма заказа',
      'old_order_price' => 'Old Order Price',
      'reward' => 'Вознаграждение',
      'old_reward' => 'Старое Вознаграждение',
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

  public function beforeValidate()
  {
    if ($this->scenario == 'offline') {
      $store_point = B2bStoresPoints::findOne(Yii::$app->storePointUser->id);
      if ($store_point) {
        $this->affiliate_id = $store_point->store->cpaLink->affiliate_id;
        $this->cpa_id = $store_point->store->cpaLink->cpa_id;
      } else {
        Yii::$app->session->addFlash('err', 'Ошибка при проведении платежа');
        return false;
      }
      //даты
      $dateNow = date('Y-m-d H:i:s', time());
      $this->click_date = $dateNow;
      $this->action_date = $dateNow;
      $this->status_updated = $dateNow;
      $this->closing_date = $dateNow;
      //пока непонятно
      $this->action_id = 111111111;//??
      $this->order_id = !empty($this->order_id) ? $this->order_id : '111111';
      //суммы
      $this->kurs = 1;//продположим, всё в рублях
      $this->reward = $this->storeCashback($this->order_price, $store_point->store->displayed_cashback);//вычислить возврат
      $this->cashback = $this->reward * $store_point->store->percent / 100;
      $this->shop_percent = $store_point->store->percent;
      return true;
    }
  }

  public function beforeSave($insert)
  {
    if(
      !$this->isNewRecord &&
      $this->oldAttributes['order_price']!=$this->order_price)
    {
      $this->old_order_price=$this->oldAttributes['order_price'];
    }

    if(
      !$this->isNewRecord &&
      $this->oldAttributes['reward']!=$this->reward)
    {
      $this->old_reward=$this->oldAttributes['reward'];
    }

    return parent::beforeSave($insert); // TODO: Change the autogenerated stub
  }
  
  public function afterSave($insert, $changedAttributes)
  {
    Cache::clearName('account_payments' . $this->user_id);
    Cache::clearName('account_bonuses' . $this->user_id);
  }
  public function afterDelete()
  {
    Cache::clearName('account_payments' . $this->user_id);
    Cache::clearName('account_bonuses' . $this->user_id);
  }
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
    //return $this->store->name;
    return '<a href="/admin/stores/update?id='.$this->store->uid.'">'.$this->store->name.' ('.$this->store->uid.')</a>';
  }

  public function getStringStatus()
  {
    $out=Yii::$app->help->colorStatus($this->status);
    if($this->cpa_id==1) {
      $out .= '<span class="admitad_data" data-col="status"></span>';
    }
    return $out;
  }

  public function getShowedString(){
      if ($this->status == 0) return 'Скрыт';
      if ($this->status == 1) return 'Отображен';
  }

  public function getEmail(){
    //return $this->user->email;
    $user=$this->user;
    if(!$user){
      return 'Пользователь удален - '.$this->user_id;
    }
    return '<a href="/admin/users/update?id='.$user->uid.'">'.$user->email.'('.$user->uid.')</a>';
  }

 // public function getCpaLink()
 // {
 //   return $this->hasMany(CpaLink::className(), ['spa_id' => 'cpa_id']);
 // }

  public function getUser()
  {
    return $this->hasOne(Users::className(), ['uid' => 'user_id']);
  }

  private function storeCashback($value, $cashback)
  {
    if (strpos($cashback, '%') === false) {
      return $cashback;
    } else {
      $rate = floatval(preg_replace('/[^0-9\.]/', '', $cashback));
      return $value * $rate / 100;
    }
  }
}
