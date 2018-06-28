<?php

namespace frontend\modules\actions\models;

use yii;
use frontend\modules\payments\models\Payments;
use frontend\modules\users\models\Users;
use frontend\modules\notification\models\Notifications;
use frontend\modules\promo\models\Promo;

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
     *  проверка условий завершения акций
     * @param array $users
     * @throws \yii\db\Exception
     */
    public static function observeActions($users = [])
    {
        if (empty($users)) {
            return;
        }
        $actionsUsers = ActionsToUsers::find()->from(ActionsToUsers::tableName() . ' cwau')
            ->select(['cwa.uid as action_id', 'cwa.name as action_name', 'cwau.uid as action_to_user_uid',
                'cwau.user_id as user_id',
                'cwaa.payment_count', 'cwaa.referral_count', 'cwaa.referral_count', 'cwaa.users_payment_count',
                'cwaa.new_users_payment_count', 'cwa.promo_end', 'cwau.user_id',
                'count(cwp.uid) as payments, count(newref.uid) as newrefs', 'count(ref.uid) as refs',
                'count(newrefp.uid) as newref_payments', 'count(refp.uid) as ref_payments'])
            ->innerJoin(Actions::tableName() . ' cwa', 'cwa.uid = cwau.action_id')
            ->innerJoin(self::tableName() . ' cwaa', 'cwa.uid=cwaa.action_id')
            ->leftJoin(
                Payments::tableName() . ' cwp', //платежи за время акции
                'cwp.user_id = cwau.user_id and cwp.action_date >= cwau.date_start and cwp.action_date <= cwa.date_end'
            )
            ->leftJoin(
                Users::tableName() . ' newref', //новые рефералы за время акции
                'cwp.user_id = newref.referrer_id and newref.added >= cwau.date_start and newref.added <= cwa.date_end '
            )
            ->leftJoin(
                Payments::tableName() . ' newrefp', //покупки новых рефералов за время акции
                'newrefp.user_id = newref.uid and newrefp.action_date >= cwau.date_start and newrefp.action_date <= cwa.date_end'
            )
            ->leftJoin(
                Users::tableName() . ' ref', //все рефералы
                'cwp.user_id = ref.referrer_id '
            )
            ->leftJoin(
                Payments::tableName() . ' refp', //покупки рефералов (за время акции ??)
                'refp.user_id = ref.uid and refp.action_date >= cwau.date_start and refp.action_date <= cwa.date_end'
            )
            ->where([
                'cwa.active' => 1,
                'cwau.user_id' => $users,
                'cwau.date_end' => null,
            ])
            ->having( //условия завершения акции
                '(cwaa.payment_count is null or payments >= cwaa.payment_count) ' .
                'and (cwaa.referral_count is null or newrefs >= cwaa.referral_count) ' .
                'and (cwaa.users_payment_count is null or ref_payments >= cwaa.users_payment_count)' .
                'and (cwaa.new_users_payment_count is null or newref_payments >= cwaa.new_users_payment_count)'
            )
            ->groupBy(['action_id', 'action_name', 'action_to_user_uid', 'user_id',
                'cwaa.payment_count', 'cwaa.referral_count', 'cwaa.referral_count', 'cwaa.users_payment_count',
                'cwaa.new_users_payment_count', 'cwa.promo_end', 'cwau.user_id'])
            ->asArray()
            ->all();
        //d($actionsUsers);

        if (!empty($actionsUsers)) {
            $updateResult = Yii::$app->db->createCommand()->update(
                'cw_actions_to_users',
                ['complete' => 1, 'date_end' => date('Y-m-d H:i:s')],
                ['uid' => array_column($actionsUsers, 'action_to_user_uid')]
            )->execute();

            foreach ($actionsUsers as $action) {
                if ($action['promo_end']) {
                    $user = Users::findOne($action['user_id']);
                    $promo = $user->applyPromo($action['promo_end']);
                    if ($user->save()) {
                        //уведомления пользователю
                        $notify = new Notifications();
                        $notify->user_id = $action['user_id'];
                        $notify->type_id = 0;//Прочее
                        $notify->text = Yii::t(
                            'account',
                            $promo ? 'you_did_conditions_of_{action}_and_recieved_{advantages}':
                                'you_did_conditions_of_{action}',
                            ['action' => $action['action_name'], 'advantages' => $promo ? Promo::resultText($promo): null]
                        );
                        $notify->save();
                    };
                }
            }

            if (Yii::$app instanceof Yii\console\Application) {
                d('Updated users actions '. $updateResult);
            };
        }
    }

}
