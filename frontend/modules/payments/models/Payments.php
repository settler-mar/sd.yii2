<?php

namespace frontend\modules\payments\models;

use frontend\modules\stores\models\CpaLink;
use frontend\modules\stores\models\Cpa;
use frontend\modules\stores\models\Stores;
use frontend\modules\stores\models\StoresActions;
use frontend\modules\stores\models\TariffsRates;
use frontend\modules\users\models\Users;
use frontend\modules\notification\models\Notifications;
use api\models\OauthClients;
use yii;
use frontend\modules\cache\models\Cache;
use b2b\modules\stores_points\models\B2bStoresPoints;
use common\models\Admitad;

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

  //при поиске - суммы в валюте операции
  public $order_price_local;
  public $cashback_local;
  public $reward_local;

  private $_store;
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
            'ref_id', 'loyalty_status', 'shop_percent', 'action_code', 'store_point_id', 'rate_id'], 'integer'],
        [['recalc_json'], 'string'],
        [['user_id'], 'integer', 'on' => 'online'],
        [['user_id'], 'match', 'pattern' => '/^SD-\d*$/', 'on' => 'offline',
            'message' => 'ID пользователя должно быть в формате SD-xxxxxxxx'],
        [['user_id'], 'filter', 'on' => 'offline', 'filter' => function ($value) {
          $value = intval(preg_replace('/[^0-9\.]/', '', $value));
          return $value;
        }],
        [['user_id', 'order_price'], 'required'],
        [['order_id'], 'required', 'on' => 'offline'],
        [['action_id', 'affiliate_id', 'click_date', 'action_date', 'status_updated', 'closing_date'], 'required',
            'on' => 'online'],
        [['order_price', 'reward', 'cashback', 'ref_bonus', 'kurs', 'ref_kurs'],
            'number', 'message' => "Значение должно быть числом.\nКопейки должны отделяться точкой."],
        [['click_date', 'action_date', 'status_updated', 'closing_date', 'storeName', 'email', 'category'], 'safe'],

        [['order_id'], 'string', 'max' => 50],
        [['admin_comment'], 'string', 'max' => 255],
        [['category'], 'required', 'on' => 'offline', 'message' => 'Необходимо выбрать "Категория покупки"'],
        [['category'], 'integer'],
        [['sub_id'], 'integer'],
    ];
  }

  /**
   * @inheritdoc
   */
  public function attributeLabels()
  {
    return [
        'uid' => 'ID',
        'admin_comment' => 'Коментарий администратора',
        'is_showed' => 'Is Showed',
        'action_id' => 'Код действия',
        'affiliate_id' => 'Affiliate ID (Код связанной CPA)',
        'user_id' => 'Пользователь',
        'order_price' => 'Сумма заказа',
        'old_order_price' => 'Old Order Price',
        'reward' => 'Вознаграждение',
        'old_reward' => 'Старое Вознаграждение',
        'cashback' => 'Кэшбэк',
        'status' => 'Статус',
        'click_date' => 'Дата покупки',
        'action_date' => 'Action Date',
        'status_updated' => 'Status Updated',
        'closing_date' => 'Closing Date',
        'cpa_id' => 'CPA ID',
        'additional_id' => 'Additional ID (Вспомогательный код для тарифа)',
        'ref_bonus_id' => 'Ref Bonus ID',
        'ref_bonus' => 'Кэшбэк бонус',
        'ref_id' => 'Ref ID',
        'loyalty_status' => 'Loyalty Status',
        'order_id' => 'Номер заказа',
        'shop_percent' => 'Shop Percent',
        'kurs' => 'kurs',
        'storeName' => 'Название магазина',
        'cpaName' => 'CPA',
        'store_point_id' => 'ID точки продаж',
        'storePointName' => 'Точка продаж',
    ];
  }


  public function beforeValidate()
  {
    if (!$this->ref_bonus_id) $this->ref_bonus_id = 0;

    if ($this->isNewRecord) {
      //для оффлайн шопов с формы
      if ($this->scenario == 'offline') {
        if (!$this->_store) {
          $this->_store = B2bStoresPoints::findOne(Yii::$app->storePointUser->id)->store;
        }
        $store = $this->_store;
        if ($store) {
          $this->affiliate_id = $store->cpaLink->id;//affiliate_id;
          $this->cpa_id = $store->cpaLink->cpa_id;
        } else {
          Yii::$app->session->addFlash('err', 'Ошибка при проведении платежа');
          return false;
        }

        $action = StoresActions::findOne([
            'uid' => $this->category,
            'cpa_link_id' => $store->cpaLink->id,
        ]);
        if (!$action) {
          Yii::$app->session->addFlash('err', 'Ошибка - неправильная категория');
          return false;
        }

        //даты
        $dateNow = date('Y-m-d H:i:s', time());
        $this->click_date = $dateNow;
        $this->action_date = $dateNow;
        $this->status_updated = $dateNow;
        $this->closing_date = date("Y-m-d H:i:s", strtotime("+" . $action->hold_time . " day"));;

        //прочее
        $this->action_id = time();
        $this->order_id = !empty($this->order_id) ? $this->order_id : time();
        $this->additional_id = 0;
        $this->is_showed = 1;
        $this->status = 0;

        $this->store_point_id = Yii::$app->storePointUser->id;

        //суммы
        //$action = StoresActions::findOne($this->category);

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
        $this->rate_id = $rates->uid;

        $this->updateRecalcJson($action, $tariff, $rates);

        if ($rates->is_percentage) {
          $reward = $this->order_price * $rates->size * $this->kurs / 100;
          $cashback = $this->order_price * $rates->our_size * $this->kurs / 100;
        } else {
          $reward = $rates->size;
          $cashback = $rates->our_size;
        }

        $reward = round($reward, 2);

        // просчет лояльности
        $user_id = intval(preg_replace('/[^0-9\.]/', '', $this->user_id));
        $user = Users::findOne(['uid' => $user_id]);
        if (!$user) {
          Yii::$app->session->addFlash('err', 'Ошибка - не найден пользователь!');
          return false;
        }

        $loyalty_bonus = $user->loyalty_status_data['bonus'];
        $this->loyalty_status = $user->loyalty_status;

        $cashback = $cashback + $cashback * $loyalty_bonus / 100;
        $cashback = round($cashback, 2);

        $this->reward = $reward;
        $this->cashback = $cashback;
        $this->shop_percent = $store->percent;
      } else {
        $this->updateRecalcJson();
        $this->store_point_id = $this->store_point_id ? (int)$this->store_point_id : 0;
      }
    }
    return parent::beforeValidate();
  }

  public function beforeSave($insert)
  {
    if (
        !$this->isNewRecord &&
        $this->oldAttributes['order_price'] != $this->order_price
    ) {
      $this->old_order_price = $this->oldAttributes['order_price'];
    }

    if (
        !$this->isNewRecord &&
        $this->oldAttributes['reward'] != $this->reward
    ) {
      $this->old_reward = $this->oldAttributes['reward'];
    }

    return parent::beforeSave($insert); // TODO: Change the autogenerated stub
  }

  public function afterSave($insert, $changedAttributes)
  {
    if ($this->scenario == 'offline') {
      \Yii::$app->balanceCalc->todo($this->user_id, 'cash');
    }
    Cache::clearName('account_payments' . $this->user_id);
    Cache::clearName('account_bonuses' . $this->user_id);

    if (($insert || isset($changedAttributes['status']) && $changedAttributes['status'] != $this->attributes['status'])
        && !empty($this->user->oauthClient) && !empty($this->user->oauthClient->redirect_uri)) {
        //новый платёж или поменялся статус, и юсер клиент oauth, и есть redirect_uri
        OauthClients::paymentCallback($this->user, $this);
    }
  }

  public function afterDelete()
  {
    Cache::clearName('account_payments' . $this->user_id);
    Cache::clearName('account_bonuses' . $this->user_id);
  }

  public function getCpaLink()
  {
    return $this->hasOne(CpaLink::className(), ['affiliate_id' => 'affiliate_id', 'cpa_id' => 'cpa_id']);
  }

  public function getCpa()
  {
      return $this->hasOne(Cpa::className(), ['id' => 'cpa_id']);
  }

  public function getStore()
  {
    return $this->hasOne(Stores::className(), ['uid' => 'stores_id'])
        ->via('cpaLink');
  }

  public function getStoreName()
  {
    if (!$this->_store) {
      $this->_store = $this->store;
    }
    if (!$this->_store) {
      //ddd($this);
      return "err";
    };
    //return $this->store->name;
    return '<a target="_blank" href="/admin/stores/update?id=' . $this->_store->uid . '" rel="nofollow noopener">' . $this->_store->name . ' (' . $this->store->uid . ')</a>';
  }

  public function getCpaName()
  {
      return $this->cpa->name;
  }

  public function getStoreCur()
  {
    if (!$this->_store) {
      $this->_store = $this->store;
    }
    if (!$this->_store) {
      return "err";
    };
    return $this->store->currency;
  }

  public function getStringStatus()
  {
    $out = Yii::$app->help->colorStatus($this->status);
    if ($this->cpa_id == 1) {
      $out .= '<span class="admitad_data" data-col="status"></span>';
    }
    return $out;
  }

  public function getShowedString()
  {
    if ($this->status == 0) return 'Скрыт';
    if ($this->status == 1) return 'Отображен';
  }

  public function getEmail()
  {
    //return $this->user->email;
    $user = $this->user;
    if (!$user) {
      return 'Пользователь удален - ' . $this->user_id;
    }
    return '<a href="/admin/users/update?id=' . $user->uid . '">' . $user->email . '(' . $user->uid . ')</a>';
  }

  // public function getCpaLink()
  // {
  //   return $this->hasMany(CpaLink::className(), ['spa_id' => 'cpa_id']);
  // }

  public function getUser()
  {
    return $this->hasOne(Users::className(), ['uid' => 'user_id']);
  }

  public function getStoresPoint()
  {
    return $this->hasOne(B2bStoresPoints::className(), ['id' => 'store_point_id']);
  }

  public function getStoresPointText()
  {
    $point = $this->getStoresPoint()->one();
    return $point->name . ', ' . $point->country . ', ' . $point->city . ', ' . $point->address;
  }

  public function updateRecalcJson($action = false, $tariff = false, $rates = false)
  {
    if (!$rates) {
      $rates = TariffsRates::find()
          ->where(['uid' => $this->rate_id])
          ->one();
    }

    if (!$action) {
      $action = StoresActions::find()
          ->where(['action_id' => $this->action_code])
          ->one();
    }

    if (!$tariff && $action && $rates) {
      $tariff = $rates->getTariff()
          ->one();
    }

    if (!$action || !$tariff || !$rates) {
      return false;
    }

    $action = $action->toArray();
    $tariff = $tariff->toArray();
    $rates = $rates->toArray();

    $recalc_json = [
        'action' => [
            'uid' => $action['uid'],
            'name' => $action['name']
        ],
        'tariff' => [
            'uid' => $tariff['uid'],
            'name' => $tariff['name']
        ],
        'rate' => $rates,
    ];
    $this->recalc_json = json_encode($recalc_json);
  }

  public function getTariffText()
  {
    if (!$this->recalc_json || strlen($this->recalc_json) < 5) {
      return "Нет данных";
    }

    $data = json_decode($this->recalc_json, true);
    if (!$this->_store) {
      $this->_store = $this->store;
    }
    if (!$this->_store) {
      return "ERR";
    }

    $out = $this->_store->is_offline ? $data['action']['name'] : $data['tariff']['name'];
    $suf = $data['rate']['is_percentage'] ? '%' : $this->_store->currency;
    $out .= ' (вознаграждение: ';
    $out .= $data['rate']['size'] . $suf;
    $out .= '; кэшбек: ';
    $out .= $data['rate']['our_size'] . $suf;
    $out .= ')';
    return $out;
  }

  public static function recalcCashback($id, $newPrice)
  {
    $payment = self::findOne($id);
    if (!$payment || empty($payment->recalc_json) || strlen($payment->recalc_json) < 5) {
      return null;
    }
    $newPrice = round($newPrice, 2);
    $recalc = json_decode($payment->recalc_json, true);
    if ($recalc['rate']['is_percentage']) {
      $reward = $newPrice * $recalc['rate']['size'] * $payment->kurs / 100;
      $cashback = $newPrice * $recalc['rate']['our_size'] * $payment->kurs / 100;
    } else {
      $reward = $recalc['rate']['size'];
      $cashback = $recalc['rate']['our_size'];
    }
    $loyalty_status_list = Yii::$app->params['dictionary']['loyalty_status'];
    if (isset($loyalty_status_list[$payment->loyalty_status]['bonus'])) {
      $loyalty_bonus = $loyalty_status_list[$payment->loyalty_status]['bonus'];
      $cashback = $cashback + $cashback * $loyalty_bonus / 100;
    }
    $reward = round($reward, 2);
    $cashback = round($cashback, 2);
    return [
        'reward' => $reward,
        'cashback' => $cashback,
        'order_price' => $newPrice
    ];
  }

  /**
   * @param $payment
   * @param null $store
   * @param null $user
   * @param null $ref
   * @param array $params - что обновлять при обновлении, если не задано то всё
   * @return array
   */
  public static function makeOrUpdate($payment, $store, $user = null, $ref = null, $options = [], $params = [])
  {
    $saveStatus = false;
    $newRecord = false;
    $notify = isset($options['notify']) && $options['notify'] === false ? false : true;
    $email = isset($options['email']) && $options['email'] === false ? false : true;
    if (strpos($payment['subid'], '_') !== false && !isset($payment['sub_id2'])) {
        $subIds = explode('_', $payment['subid']);
        $payment['subid'] = $subIds[0];
        $payment['sub_id2'] = isset($subIds[1]) ? $subIds[1] : 0;
    } else {
        $payment['sub_id2'] = null;
    }

    if (isset($payment['positions']) && isset($payment['positions'][0]) && isset($payment['positions'][0]['rate_id'])) {
      $rate = TariffsRates::find()
          ->where(['id_rate' => $payment['positions'][0]['rate_id']])
          ->one();
      if ($rate) {
        $rate_id = $rate->uid;
      } else {
        $rate_id = 0;
      }
    } else {
      $rate_id = 0;
    }

    $db_payment = self::findOne(['action_id' => $payment['action_id'], 'affiliate_id' => $payment['affiliate_id']]);
    //$db_payment = self::findOne(['action_id' => $payment['action_id']]);
    if (!$db_payment) {
      //если не задан шоп но ищем
      $newRecord = true;
      //не задан юсер то ищем
      $user = $user ? $user : Users::findOne(['uid' => $payment['subid']]);

      if (!$store || !$user) {
        return [
            'payment' => null,
            'save_status' => false,
            'new_record' => true,
            'remove_ref_bonus' => false,
        ];
      }
      //не задан реф и имеется rererrer_id у юсера то ищем
      $ref = $ref ? $ref : ($user->referrer_id ? Users::findOne(['uid' => $user->referrer_id]) : null);

      $db_payment = new self(['scenario' => 'online']);
      $db_payment->scenario = 'online';

      $userCashback = self::userCashback($db_payment, $payment, true, $user, $store, $ref);

      $db_payment->action_id = $payment['action_id'];
      $db_payment->is_showed = 1;
      $db_payment->user_id = $payment['subid'];
      $db_payment->sub_id = $payment['sub_id2'];
      $db_payment->order_price = ($payment['cart'] ? $payment['cart'] : 0);
      $db_payment->reward = $userCashback['reward'];//$reward;
      $db_payment->cashback = $userCashback['cashback'];
      $db_payment->status = $payment['status'];
      $db_payment->affiliate_id = $payment['affiliate_id'];
      $db_payment->cpa_id = $payment['cpa_id'];
      $db_payment->click_date = $payment['click_date'];
      $db_payment->action_date = $payment['action_date'];
      $db_payment->status_updated = $payment['status_updated'];
      $db_payment->closing_date = $payment['closing_date'];
      if (isset($payment['ip'])) $db_payment->ip = $payment['ip'];
      if (isset($payment['product_country_code'])) {
        $db_payment->additional_id = $payment['product_country_code'];
      }
      $db_payment->loyalty_status = $user->loyalty_status;
      $db_payment->shop_percent = $store->percent;
      $db_payment->order_id = $payment['order_id'];
      $db_payment->kurs = $userCashback['kurs'];
      $db_payment->action_code = $payment['tariff_id'];
      $db_payment->rate_id = $rate_id;

      if ($ref) {
        $db_payment->ref_id = $user->referrer_id;
        $db_payment->ref_bonus_id = $ref->bonus_status;
        $db_payment->ref_kurs = $userCashback['ref_kurs'];
        $db_payment->ref_bonus = $userCashback['ref_bonus'];
      }

      if (!$db_payment->closing_date) {
        $time = strtotime($payment['action_date']);
        $time += $store->hold_time * 24 * 60 * 60;
        $db_payment->closing_date = date("Y-m-d H:i:s", $time);
      }
      $saveStatus = $db_payment->save();
      if ($saveStatus && $notify) {
        self::makeNotification($payment['subid'], [
            'type_id' => 1,
            'status' => $db_payment->status,
            'amount' => $db_payment->cashback,
            'payment_id' => $db_payment->uid,
        ]);
      }
      if ($saveStatus && $email) {
        try {
          Yii::$app
              ->mailer
              ->compose(
                  ['html' => 'newPayment-html', 'text' => 'newPayment-text'],
                  [
                      'user' => $user,
                      'payment' => $db_payment,
                  ]
              )
              ->setFrom([Yii::$app->params['adminEmail'] => Yii::$app->params['adminName']])
              ->setTo($user->email)
              ->setSubject(Yii::$app->name . ': Зафиксирован новый кэшбэк')
              ->send();
        } catch (\Exception $e) {
        }
      }
    } else {
      //обновляем старый платеж
      $userCashback = self::userCashback($db_payment, $payment);

      $db_payment->kurs = $db_payment->kurs ? $db_payment->kurs : $userCashback['kurs'];

      if (isset($payment['ip'])) $db_payment->ip = $payment['ip'];
      //для подтвержденных заказов ни чего не меняем уже кроме отдельных ячеек
      if ($db_payment->status == 2) {

        if ($db_payment->status != $payment['status']) {
          $db_payment->status = $payment['status'];
          Yii::$app->logger->add($payment, 'payment_status_wrong', false);
          Notifications::deleteAll([
              'payment_id' => $db_payment->uid,
              'type_id' => 3
          ]);
        }
        //через врямя удалить
        $db_payment->action_code = $payment['tariff_id']; //нужно для заполнения поля тарифа
        $db_payment->rate_id = $rate_id;
      } else {

        $db_payment->reward = $userCashback['reward'];
        $db_payment->cashback = $userCashback['cashback'];
        $db_payment->status = $payment['status'];

        if ($db_payment->ref_id) {
          $db_payment->ref_bonus = $userCashback['ref_bonus'];
        }
      }
      if (count($db_payment->getDirtyAttributes()) > 0) {
        $saveStatus = $db_payment->save();
      } else {
        $saveStatus = false;
      }
      if ($saveStatus && $notify && $user->referrer_id > 0 && $db_payment->status == 2) {
        self::makeNotification($user->referrer_id, [
            'type_id' => 3,
            'status' => $db_payment->status,
            'amount' => $db_payment->ref_bonus,
            'payment_id' => $db_payment->uid,
        ]);
      }
    }
    //ddd($db_payment);
    return [
        'payment' => $db_payment,
        'save_status' => $saveStatus,
        'new_record' => $newRecord,
    ];

  }

  /**
   * @param $userId
   * @param $data
   */
  protected static function makeNotification($userId, $data)
  {
    //Создаем нотификацию
    $notifi = new Notifications();
    $notifi->user_id = $userId;
    $notifi->type_id = $data['type_id'];
    $notifi->status = $data['status'];
    $notifi->amount = $data['amount'];
    $notifi->payment_id = $data['payment_id'];
    $notifi->save();
  }

  protected static function userCashback($db_payment, $payment, $new = false, $user = null, $store = null, $ref = null)
  {
    $percent = $new ? $store->percent : $db_payment->shop_percent;

    $kurs = $new ? Yii::$app->conversion->getCurs($user->currency, $payment['currency'])
        : $db_payment->kurs;
    //в старых платежах нет курса. Получаем его косвенно
    if (!$kurs) {
      $kurs = Yii::$app->conversion->getRUB(1, $payment['currency']);
    }

    //ddd($kurs);
    $loyalty_bonus = $new ? $user->loyalty_status_data['bonus'] :
        Yii::$app->params['dictionary']['loyalty_status'][$db_payment->loyalty_status]['bonus'];

    $reward = $kurs * $payment['payment'];

    $cashback = $reward * $percent / 100;
    $cashback = $cashback + $cashback * $loyalty_bonus / 100;

    if ($ref || (!$new && $db_payment->ref_id)) {
      $ref_kurs = $new ? Yii::$app->conversion->getCurs($ref->currency, $user->currency) : $db_payment->ref_kurs;;
      $ref_kurs = $ref_kurs ? $ref_kurs : 1;

      $ref_bonus_data = $new ? $ref->bonus_status_data :
          Yii::$app->params['dictionary']['bonus_status'][$db_payment->ref_bonus_id];

      if (isset($ref_bonus_data['is_webmaster']) && $ref_bonus_data['is_webmaster'] == 1) {
        $ref_bonus = ($reward - $cashback) * $ref_bonus_data['bonus'] * $ref_kurs / 100;
      } else {
        $ref_bonus = $cashback * $ref_bonus_data['bonus'] * $ref_kurs / 100;
      }
    }
    return [
        'cashback' => round($cashback, 2),
        'reward' => round($reward, 2),
        'kurs' => $kurs,
        'ref_bonus' => isset($ref_bonus) ? round($ref_bonus, 2) : null,
        'ref_kurs' => isset($ref_kurs) ? $ref_kurs : null,
    ];
  }

}
