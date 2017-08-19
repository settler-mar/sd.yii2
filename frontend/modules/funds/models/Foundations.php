<?php

namespace frontend\modules\funds\models;

use Yii;

/**
 * This is the model class for table "cw_foundation".
 *
 * @property integer $uid
 * @property string $title
 * @property string $description
 * @property string $image
 * @property integer $is_active
 */
class Foundations extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cw_foundation';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['title', 'description', 'image', 'is_active'], 'required'],
            [['description'], 'string'],
            [['is_active'], 'integer'],
            [['title', 'image'], 'string', 'max' => 255],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'uid' => 'Uid',
            'title' => 'Title',
            'description' => 'Description',
            'image' => 'Image',
            'is_active' => 'Is Active',
        ];
    }
}
