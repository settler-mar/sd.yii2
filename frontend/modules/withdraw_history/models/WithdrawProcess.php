<?php

namespace frontend\modules\withdraw_history\models;

use Yii;

/**
 * This is the model class for table "cw_withdraw_process".
 *
 * @property integer $uid
 * @property string $name
 */
class WithdrawProcess extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cw_withdraw_process';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['name'], 'required'],
            [['name'], 'string', 'max' => 255],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'uid' => 'Uid',
            'name' => 'Name',
        ];
    }
}
