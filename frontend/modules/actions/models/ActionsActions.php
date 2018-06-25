<?php

namespace frontend\modules\actions\models;

use Yii;

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
}
