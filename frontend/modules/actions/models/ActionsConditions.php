<?php

namespace frontend\modules\actions\models;

use Yii;

/**
 * This is the model class for table "cw_actions_conditions".
 *
 * @property integer $uid
 * @property integer $action_id
 * @property string $stores_list
 * @property integer $referral_count
 * @property integer $payment_count
 * @property integer $loyalty_status
 * @property integer $bonus_status
 * @property string $date_register_from
 * @property string $date_register_to
 * @property string $created_at
 *
 * @property Actions $action
 */
class ActionsConditions extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cw_actions_conditions';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['action_id'], 'required'],
            [['action_id', 'referral_count', 'payment_count', 'loyalty_status', 'bonus_status'], 'integer'],
            [['stores_list'], 'string'],
            [['date_register_from', 'date_register_to', 'created_at'], 'safe'],
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
            'stores_list' => 'Stores List',
            'referral_count' => 'Referral Count',
            'payment_count' => 'Payment Count',
            'loyalty_status' => 'Loyalty Status',
            'bonus_status' => 'Bonus Status',
            'date_register_from' => 'Date Register From',
            'date_register_to' => 'Date Register To',
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
