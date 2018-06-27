<?php

namespace frontend\modules\actions\models;

use Yii;
use frontend\modules\payments\models\Payments;
use frontend\modules\users\models\Users;

/**
 * This is the model class for table "cw_actions_actions".
 *
 * @property integer $uid
 * @property integer $action_id
 * @property integer $payment_count
 * @property string $payment_stores_list
 * @property integer $referral_count
 * @property integer $users_payment_count
 * @property integer $new_users_payment_count
 * @property string $created_at
 *
 * @property Actions $action
 */
class ActionsActions extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cw_actions_actions';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['action_id'], 'required'],
            [['action_id', 'payment_count', 'referral_count', 'users_payment_count', 'new_users_payment_count'], 'integer'],
            [['payment_stores_list'], 'string'],
            [['created_at'], 'safe'],
            [['action_id'], 'exist', 'skipOnError' => true, 'targetClass' => Actions::className(), 'targetAttribute' => ['action_id' => 'uid']],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'uid' => 'Uid',
            'action_id' => 'Action ID',
            'payment_count' => 'Количество покупок',
            'payment_stores_list' => 'Покупки в шопах',
            'referral_count' => 'Количество приведённых реферралов',
            'users_payment_count' => 'Количество покупок реферралов',
            'new_users_payment_count' => 'Количество покупок новых реферралов',
            'created_at' => 'Created At',
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getAction()
    {
        return $this->hasOne(Actions::className(), ['uid' => 'action_id']);
    }

    /**
     * пока только на количество покупок
     * @param array $users
     * @throws \yii\db\Exception
     */
    public static function observeActions($users = [])
    {

        if (empty($users)) {
            return;
        }
         $actionsUsers = ActionsToUsers::find()->from(ActionsToUsers::tableName() . ' cwau')
             ->select(['cwau.uid as action_to_user_id', 'cwaa.payment_count','cwa.promo_end', 'cwau.user_id', 'count(cwp.uid) as payments'])
             ->innerJoin(Actions::tableName().' cwa', 'cwa.uid = cwau.action_id')
             ->innerJoin(self::tableName(). ' cwaa', 'cwa.uid=cwaa.action_id')
             ->leftJoin(
                 Payments::tableName() .' cwp',
                 'cwp.user_id = cwau.user_id and cwp.action_date > cwau.date_start and cwp.action_date < cwa.date_end'
             )
             ->where([
                 'cwa.active' => 1,
                 'cwau.user_id' => $users,
                 'cwau.date_end' => null,
             ])
             ->andWhere(['>', 'cwaa.payment_count', 0])
             ->having(['>=', 'payments', 'cwaa.payment_count'])
             ->groupBy(['cwau.uid', 'cwaa.payment_count', 'cwau.user_id'])
             ->asArray()
             ->all();
        //ddd($actionsUsers);
        foreach ($actionsUsers as $action) {
            if ($action['promo_end']) {
                $user = Users::findOne($action['user_id']);
                $user->applyPromo($action['promo_end']);
                $user->save();
            }
        }
        $updateResult = Yii::$app->db->createCommand()->update(
            'cw_actions_to_users',
            ['complete' => 1, 'date_end' => date('Y-m-d H:i:s')],
            ['uid' => array_column($actionsUsers, 'action_to_user_id')]
        )->execute();
//        $sql = 'UPDATE `cw_actions_to_users` SET `complete` = 1, `date_end` = "'.date('Y-m-d H:i:s').'" WHERE `uid` IN '.
//            '(SELECT conditions.uid from (SELECT `cwau`.`uid`, `cwaa`.`payment_count`, count(cwp.uid) as `payments` '.
//            ' FROM `cw_actions_to_users` `cwau` '.
//            ' INNER JOIN `cw_actions` `cwa` ON `cwa`.`uid` = `cwau`.`action_id` '.
//            ' INNER JOIN `cw_actions_actions` `cwaa` ON `cwa`.`uid` = `cwaa`.`action_id` '.
//            ' LEFT JOIN `cw_payments` `cwp` ON `cwp`.`user_id` = `cwau`.`user_id` and `cwp`.`action_date` > `cwau`.`date_start` and `cwp`.`action_date` < `cwa`.`date_end` '.
//            ' WHERE `cwa`.`active`=1 and `cwau`.`user_id` in ('.implode(',', $users).') and `cwau`.`date_end` IS NULL and `cwaa`.`payment_count` > 0 '.
//            ' GROUP BY `cwau`.`uid` , `cwaa`.`payment_count` '.
//            ' HAVING `payments` >= `cwaa`.`payment_count`) conditions )';

        //$updateResult = Yii::$app->db->createCommand($sql)->execute();

        //ddd($updateResult);
    }

}
