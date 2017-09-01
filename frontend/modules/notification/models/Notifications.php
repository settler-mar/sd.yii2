<?php

namespace frontend\modules\notification\models;

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
            'uid' => 'Uid',
            'user_id' => 'User ID',
            'type_id' => 'Type ID',
            'added' => 'Added',
            'is_viewed' => 'Is Viewed',
            'status' => 'Status',
            'amount' => 'Amount',
            'payment_id' => 'Payment ID',
            'text' => 'Text',
            'admin_comment' => 'Admin Comment',
            'twig_template' => 'Twig Template',
        ];
    }

  public function beforeValidate()
  {
    if (!parent::beforeValidate()) {
      return false;
    }

    if ($this->isNewRecord) {
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
        $cacheName ='account_notification_unread_count_' . $userId;
        $dependencyName = 'account_notification_unread';
        $dependency = new yii\caching\DbDependency;
        $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $dependencyName . '"';
        return \Yii::$app->cache->getOrSet($cacheName, function () use ($userId) {
            return self::find()
            ->where(['user_id' => $userId, 'type_id' => 2, 'is_viewed' => 0])
            ->count();
        }, \Yii::$app->cache->defaultDuration, $dependency);
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
    Cache::clearName('account_notification_unread');
    Cache::clearName('account_notifications');
  }
  public function afterDelete()
  {
    Cache::clearName('account_notification_unread');
    Cache::clearName('account_notifications');
  }
}
