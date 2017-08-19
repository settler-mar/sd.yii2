<?php

namespace frontend\modules\withdraw_history\models;

use Yii;

/**
 * This is the model class for table "cw_users_withdraw".
 *
 * @property integer $uid
 * @property integer $user_id
 * @property integer $process_id
 * @property string $bill
 * @property double $amount
 * @property integer $status
 * @property string $request_date
 * @property string $user_comment
 * @property string $admin_comment
 */
class UsersWithdraw extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cw_users_withdraw';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['user_id', 'process_id', 'bill', 'request_date', 'user_comment', 'admin_comment'], 'required'],
            [['user_id', 'process_id', 'status'], 'integer'],
            [['amount'], 'number'],
            [['request_date'], 'safe'],
            [['user_comment', 'admin_comment'], 'string'],
            [['bill'], 'string', 'max' => 255],
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
            'process_id' => 'Process ID',
            'bill' => 'Bill',
            'amount' => 'Amount',
            'status' => 'Status',
            'request_date' => 'Request Date',
            'user_comment' => 'User Comment',
            'admin_comment' => 'Admin Comment',
        ];
    }
}
