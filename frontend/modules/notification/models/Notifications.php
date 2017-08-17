<?php

namespace frontend\modules\notifications\models;

use Yii;

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
}
