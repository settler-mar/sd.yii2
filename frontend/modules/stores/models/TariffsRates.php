<?php

namespace frontend\modules\stores\models;

use Yii;

/**
 * This is the model class for table "cw_tariffs_rates".
 *
 * @property integer $uid
 * @property integer $id_tariff_out
 * @property integer $id_rate
 * @property double $price_s
 * @property double $size
 * @property double $our_size
 * @property integer $is_percentage
 * @property integer $auto_update
 * @property integer $id_tariff
 * @property string $additional_id
 * @property string $date_s
 */
class TariffsRates extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cw_tariffs_rates';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['id_rate', 'is_percentage', 'auto_update', 'id_tariff'], 'integer'],
            [['id_rate', 'price_s', 'size', 'our_size', 'is_percentage'], 'required'],
            [['price_s', 'size', 'our_size'], 'number'],
            [['date_s'], 'safe'],
            [['additional_id'], 'string', 'max' => 5],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'uid' => 'Uid',
            'id_rate' => 'Id Rate',
            'price_s' => 'Price S',
            'size' => 'Size',
            'our_size' => 'Our Size',
            'is_percentage' => 'Is Percentage',
            'auto_update' => 'Auto Update',
            'id_tariff' => 'Id Tariff',
            'additional_id' => 'Additional ID',
            'date_s' => 'Date S',
        ];
    }

  public function getTariff()
  {
    return $this->hasOne(ActionsTariffs::className(), ['uid' => 'id_tariff']);
  }
}
