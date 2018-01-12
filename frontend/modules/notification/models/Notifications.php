<?php

namespace frontend\modules\notification\models;

use frontend\modules\users\models\Users;
use yii;
use frontend\modules\cache\models\Cache;

/**
 * This is the model class for table "cw_users_notification".
 *
 * @property integer $uid
 * @property integer $user_id
 * @property integer $type_id
 * @property string $added
 * @property integer $is_viewed
 * @property integer $status
 * @property double $amount
 * @property integer $payment_id
 * @property string $text
 * @property string $admin_comment
 * @property integer $twig_template
 */
class Notifications extends \yii\db\ActiveRecord
{
  /**
   * @inheritdoc
   */
  public static function tableName()
  {
    return 'cw_users_notification';
  }

  /**
   * @inheritdoc
   */
  public function rules()
  {
    return [
      [['user_id', 'type_id', 'added'], 'required'],
      [['user_id', 'type_id', 'is_viewed', 'status', 'payment_id', 'twig_template'], 'integer'],
      [['added'], 'safe'],
      [['amount'], 'number'],
      [['text', 'admin_comment'], 'string'],
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
      'type_id' => 'Тип',
      'added' => 'Добавлено',
      'is_viewed' => 'Просмотрено',
      'status' => 'Статус',
      'amount' => 'Сумма',
      'payment_id' => 'Связанный платеж',
      'text' => 'Text',
      'admin_comment' => 'Комментарий администратора',
      'twig_template' => 'Шаблон',
    ];
  }

  public function beforeValidate()
  {
    if (!parent::beforeValidate()) {
      return false;
    }

    if ($this->isNewRecord) {
      $this->amount=(float)$this->amount;
      $this->payment_id=(int)$this->payment_id;
      $this->added = date('Y-m-d H:i:s');
    }

    return true;
  }

  /**
   * @param $userId
   * @return mixed
   */
  public static function getUnreadCount($userId)
  {
    $cacheName = 'account_notification_unread_count_' . $userId;
    return \Yii::$app->cache->getOrSet($cacheName, function () use ($userId) {
      return self::find()
        ->where(['user_id' => $userId, 'type_id' => 2, 'is_viewed' => 0])
        ->count();
    });
  }

  /**
   * отметить оповещения с uid из массива $ids для пользователя как прочитанные
   * @param $userId
   * @param $ids array uid
   */
  public static function doRead($userId, $ids)
  {
    $count = self::getUnreadCount($userId);
    // ddd($count);
    if ($count) {
      $where = ['user_id' => $userId, 'type_id' => 2, 'is_viewed' => 0, 'uid' => $ids];

      self::updateAll(['is_viewed' => 1], $where);
      //чистим кеш - количество непрочитанных для пользователя
      \Yii::$app->cache->delete('account_notification_unread_count_' . $userId);
    }
  }

  public function afterSave($insert, $changedAttributes)
  {
    $users = [(int)$this->user_id];
    if (!$insert && $changedAttributes['user_id']) {
      $users[] = (int)$changedAttributes['user_id'];
    }
    Yii::$app->balanceCalc->todo($users, 'bonus');

    //ключ
    Cache::deleteName('account_notification_unread_count_' . $this->user_id);
    //зависимость
    Cache::clearName('account_notifications' . $this->user_id);
  }

  public function afterDelete()
  {
    Yii::$app->balanceCalc->todo($this->user_id, 'bonus');

    Cache::deleteName('account_notification_unread_count_' . $this->user_id);
    Cache::clearName('account_notifications' . $this->user_id);
  }

  public function getUser()
  {
    return $this->hasOne(Users::className(), ['uid' => 'user_id']);
  }

  public function getEmail()
  {
    //return $this->user->email;
    $user = $this->user;
    if (!$user) {
      return '-';
    }
    return '<a href="/admin/users/update?id=' . $user->uid . '">' . $user->email . '(' . $user->uid . ')</a>';
  }

  public function getStringIsViewed()
  {
    if ($this->is_viewed == 0) return 'Нет';
    if ($this->is_viewed == 1) return 'Просмотрен';
  }

  public function getStringType()
  {
    $list = (\Yii::$app->params['dictionary']['notification_type']);
    $tpl_twig = (\Yii::$app->params['dictionary']['twig_list_name']);

    if (!isset($list[$this->type_id])) {
      return '-';
    }

    if (
      $this->type_id == 2 &&
      $this->twig_template > 0 &&
      isset($tpl_twig[$this->twig_template])
    ) {
      return $tpl_twig[$this->twig_template];
    }

    return $list[$this->type_id];
  }

  public function getStringStatus()
  {
    $out = Yii::$app->help->colorStatus($this->status);
    return $out;
  }

  public function getStringPayment()
  {
    if ($this->payment_id == 0) {
      return '-';
    };
    return '<a href="/admin/payments/update/id:' . $this->payment_id . '" target="_blank">' . $this->payment_id . '</a>';
  }

  public static function userNoticed($userId)
  {
      $notys = self::find()
          ->where(['user_id' => $userId, 'is_viewed' => 0])
          ->limit(10)
          ->orderBy('added')
          //->asArray()
          ->all();
      $result = [];
      foreach ($notys as $noty) {
          $result[] = [
              'type' => $noty->type_id,
              'text' => $noty->added,
          ];
      }
      return $result;
  }
}
