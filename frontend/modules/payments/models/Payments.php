<?php

namespace frontend\modules\payments\models;

use frontend\modules\stores\models\CpaLink;
use frontend\modules\stores\models\Stores;
use frontend\modules\stores\models\StoresActions;
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
 * @property integer $store_point_id
 */
class Payments extends \yii\db\ActiveRecord
{
  public $category;

  //public $store_point_id;
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
      [['uid', 'is_showed', 'action_id', 'affiliate_id', 'status', 'cpa_id', 'additional_id', 'ref_bonus_id',
        'ref_id', 'loyalty_status', 'shop_percent', 'action_code', 'store_point_id'], 'integer'],
      [['user_id'], 'integer', 'on' => 'online'],
      [['user_id'], 'match', 'pattern' => '/^SD-\d*$/', 'on' => 'offline',
        'message' => 'ID пользователя должно быть в формате SD-xxxxxxxx'],
      [['user_id'], 'filter', 'on' => 'offline', 'filter'=> function ($value) {
        $value = intval(preg_replace('/[^0-9\.]/', '', $value));
        return $value;
      }],
      [['user_id'], 'required'],
      [['action_id', 'affiliate_id', 'click_date', 'action_date', 'status_updated', 'closing_date'], 'required',
        'on' => 'online'],
      [['order_price', 'reward', 'cashback', 'ref_bonus', 'kurs'], 'number'],
      [['click_date', 'action_date', 'status_updated', 'closing_date', 'storeName', 'email', 'category'], 'safe'],

      [['order_id'], 'string', 'max' => 50],
      [['admin_comment'], 'string', 'max' => 255],
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
      'store_point_id' => 'ID точки продаж',
    ];
  }


  public function beforeValidate()
  {
    //для оффлайн шопов с формы
    if ($this->scenario == 'offline') {
      $store = B2bStoresPoints::findOne(Yii::$app->storePointUser->id)->store;
      if ($store) {
        $this->affiliate_id = $store->cpaLink->affiliate_id;
        $this->cpa_id = $store->cpaLink->cpa_id;
      } else {
        Yii::$app->session->addFlash('err', 'Ошибка при проведении платежа');
        return false;
      }

      //даты
      $dateNow = date('Y-m-d H:i:s', time());
      $this->click_date = $dateNow;
      $this->action_date = $dateNow;
      $this->status_updated = $dateNow;
      $this->closing_date = date("Y-m-d H:i:s", strtotime("+" . $store->hold_time . " day"));;

      //прочее
      $this->action_id = time();
      $this->order_id = !empty($this->order_id) ? $this->order_id : time();
      $this->additional_id = 0;
      $this->is_showed = 1;
      $this->status = 0;

      $this->store_point_id = Yii::$app->storePointUser->id;

      //суммы
      $action = StoresActions::findOne([
        'uid' => $this->category,
        'cpa_link_id' => $this->affiliate_id,
      ]);
      //$action = StoresActions::findOne($this->category);

      if (!$action) {
        Yii::$app->session->addFlash('err', 'Ошибка - неправильная категория');
        return false;
      }
      $this->action_code = $action->uid;

      $tariff = $action->getTariffs()
        ->orderBy('uid')
        ->one();
      if (!$tariff) {
        Yii::$app->session->addFlash('err', 'Ошибка - не найден тариф для категории');
        return false;
      }
      $rates = $tariff->getRates()
        ->where(['<', 'date_s', date("Y-m-d H:i:s")])
        //->orderBy(['date_s DESC','uid'])
        ->one();
      if (!$rates) {
        Yii::$app->session->addFlash('err', 'Ошибка - не найденна ставка кешбека для категории');
        return false;
      }
      $this->kurs = Yii::$app->conversion->getRUB(1, $store->currency);

      if ($rates->is_percentage) {
        $reward = $this->order_price * $rates->size * $this->kurs / 100;
        $cashback = $this->order_price * $rates->our_size * $this->kurs / 100;
      } else {
        $reward = $rates->size;
        $cashback = $rates->our_size;
      }
      $cashback = round($cashback, 2);
      $reward = round($reward, 2);

      $this->reward = $reward;
      $this->cashback = $cashback;
      $this->shop_percent = $store->percent;
    }else{
      $this->store_point_id=0;
    }

    return parent::beforeValidate();
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

}
