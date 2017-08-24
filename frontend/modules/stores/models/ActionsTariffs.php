<?php

namespace frontend\modules\stores\models;

use Yii;

/**
 * This is the model class for table "cw_actions_tariffs".
 *
 * @property integer $uid
 * @property integer $id_tariff
 * @property integer $id_action
 * @property string $name
 * @property integer $id_action_out
 */
class ActionsTariffs extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cw_actions_tariffs';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['id_tariff', 'id_action', 'name'], 'required'],
            [['id_tariff', 'id_action', 'id_action_out'], 'integer'],
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
            'id_tariff' => 'Id Tariff',
            'id_action' => 'Id Action',
            'name' => 'Name',
            'id_action_out' => 'Id Action Out',
        ];
    }

  public function getRates()
  {
    return $this->hasMany(TariffsRates::className(), ['id_tariff' => 'uid']);
  }
}
