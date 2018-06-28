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
    public $attributesToUser = ['loyalty_status', 'referrer_id', 'bonus_status', 'new_loyalty_status_end'];

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
            [['date_to', 'created_at'], 'date', 'format' => 'yyyy-M-d H:m:s'],
            [['name', 'title'], 'string', 'max' => 255],
            [['on_form', 'on_link'], 'integer'],
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
            'on_form' => 'Доступно с формы',
            'on_link' => 'Доступно со ссылки',
            'created_at' => 'Создано',
        ];
    }

    /**
     * текстовый результат от применения промокода
     * @param $promo
     * @return string
     */
    public static function resultText($promo)
    {
        $result = [];
        Yii::info($promo);
        if ($promo->loyalty_status) {
            $result[] = Yii::t('account', 'account_loyalty_status') .' '.
                (isset(Yii::$app->params['dictionary']['loyalty_status'][$promo ->loyalty_status]['display_name']) ?
                    Yii::$app->params['dictionary']['loyalty_status'][$promo ->loyalty_status]['display_name'] :
                    $promo ->loyalty_status);
        }
        if ($promo->new_loyalty_status_end > 0) {
            $result[] = Yii::t(
                'account',
                'account_loyalty_status_time_{days}',
                ['days' => $promo->new_loyalty_status_end]
            );
        } else {
            $result[] = Yii::t('account', 'forever');
        }
        if ($promo->bonus_status) {
            $result[] = Yii::t('account', 'account_bonus_status') .' '.
                (isset(Yii::$app->params['dictionary']['bonus_status'][$promo ->bonus_status]['name']) ?
                    Yii::$app->params['dictionary']['bonus_status'][$promo ->bonus_status]['name'] :
                    $promo ->bonus_status);
        }
        return implode(' ', $result);
    }

}
