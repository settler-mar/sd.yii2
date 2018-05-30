<?php
namespace frontend\modules\ar_log\models;


use Yii;
use yii\db\ActiveRecord;

/**
 * Class ActiveRecordChangeLog
 * @property integer $id
 * @property string $event
 * @property string $route
 * @property string $model
 * @property string $pk
 * @property string $old_attributes
 * @property string $new_attributes
 * @property integer $log_at
 * @package panwenbin\yii2\activerecord\changelog
 */
class ActiveRecordChangeLog extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return '{{%active_record_change_log}}';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['old_attributes', 'new_attributes'], 'string'],
            [['log_at'], 'integer'],
            [['event', 'route', 'model', 'pk'], 'string', 'max' => 255],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'event' => 'Event Name',
            'route' => 'Route',
            'model' => 'Model Class',
            'pk' => 'Primary Key Condition',
            'old_attributes' => 'Old Attributes Json',
            'new_attributes' => 'New Attributes Json',
            'log_at' => 'Log At',
        ];
    }
}