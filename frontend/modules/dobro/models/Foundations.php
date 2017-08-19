<?php

namespace frontend\modules\dobro\models;

use Yii;

/**
 * This is the model class for table "cw_metadata".
 *
 * @property integer $uid
 * @property string $page
 * @property string $title
 * @property string $description
 * @property string $keywords
 * @property string $h1
 * @property string $content
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
            [['title', 'description', 'image'], 'string'],
            [['title', 'image'], 'string', 'max' => 255],
            [['is_active'], 'integer'],
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
