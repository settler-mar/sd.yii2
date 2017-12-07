<?php

namespace frontend\modules\banners\models;

use Yii;

/**
 * This is the model class for table "cw_banners".
 *
 * @property integer $uid
 * @property string $picture
 * @property string $url
 * @property integer $new_window
 * @property integer $is_active
 * @property string $places
 * @property integer $order
 * @property string $created_at
 * @property string $updated_at
 */
class Banners extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cw_banners';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['picture', 'url'], 'required'],
            [['new_window', 'is_active', 'order'], 'integer'],
            [['created_at', 'updated_at'], 'safe'],
            [['picture', 'url', 'places'], 'string', 'max' => 255],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'uid' => 'Uid',
            'picture' => 'Изображение',
            'url' => 'Url',
            'new_window' => 'В новом окне',
            'is_active' => 'Активен',
            'places' => 'Места',
            'order' => 'Порядок',
            'created_at' => 'Создан',
            'updated_at' => 'Updated At',
        ];
    }
}
