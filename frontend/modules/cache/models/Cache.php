<?php

namespace frontend\modules\cache\models;

use Yii;
use yii\db\Expression;

/**
 * This is the model class for table "cw_cache".
 *
 * @property integer $uid
 * @property string $name
 * @property string $last_update
 */
class Cache extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cw_cache';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['name'], 'required'],
            [['last_update'], 'safe'],
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
            'last_update' => 'Last Update',
        ];
    }

    /**
     * @param $name
     */
    public static function clearName($name)
    {
        $cache = self::find()->where(['name' => $name])->one();
        if (!$cache) {
            $cache = new self;
            $cache->name = $name;
        }
        $cache->last_update = new Expression('NOW()');
        $cache ->save();
    }
}
