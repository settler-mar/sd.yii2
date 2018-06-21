<?php

namespace frontend\modules\promo\models;

use Yii;

/**
 * This is the model class for table "cw_promo".
 *
 * @property integer $uid
 * @property string $name
 * @property string $title
 * @property integer $loyalty_status
 * @property integer $referrer_id
 * @property integer $bonus_status
 * @property integer $new_loyalty_status_end
 * @property string $date_to
 * @property integer $on_form
 * @property string $created_at
 */
class Promo extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cw_promo';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['name', 'title'], 'required'],
            [['loyalty_status', 'referrer_id', 'bonus_status', 'new_loyalty_status_end'], 'integer'],
            [['date_to', 'created_at'], 'safe'],
            [['name', 'title'], 'string', 'max' => 255],
            [['on_form'], 'integer'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'uid' => 'Uid',
            'name' => 'Название',
            'title' => 'Подпись',
            'loyalty_status' => 'Статус лояльности',
            'referrer_id' => 'Referrer ID',
            'bonus_status' => 'Статус вебмастера',
            'new_loyalty_status_end' => 'Действительно дней',
            'date_to' => 'Действительно до даты',
            'on_form' => 'Доступно для выбора с формы',
            'created_at' => 'Создано',
        ];
    }

    /**
     * @return array|\yii\db\ActiveRecord[]
     */
    public static function all()
    {
        return self::find()->asArray()->all();
    }

}
