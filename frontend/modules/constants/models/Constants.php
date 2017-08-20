<?php

namespace frontend\modules\constants\models;

use Yii;

/**
 * This is the model class for table "cw_constants".
 *
 * @property integer $uid
 * @property string $name
 * @property string $title
 * @property string $text
 * @property string $ftype
 * @property string $updated_at
 */
class Constants extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cw_constants';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['name', 'title', 'text', 'ftype'], 'required'],
            [['text'], 'string'],
            [['updated_at'], 'safe'],
            [['name', 'title', 'ftype'], 'string', 'max' => 255],
            [['name'], 'unique'],
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
            'title' => 'Title',
            'text' => 'Text',
            'ftype' => 'Ftype',
            'updated_at' => 'Updated At',
        ];
    }
}
