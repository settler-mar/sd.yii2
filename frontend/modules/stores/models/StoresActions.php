<?php

namespace frontend\modules\stores\models;

use Yii;

/**
 * This is the model class for table "cw_stores_actions".
 *
 * @property integer $uid
 * @property integer $action_id
 * @property string $name
 * @property integer $hold_time
 * @property integer $type
 * @property integer $cpa_link_id
 */
class StoresActions extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cw_stores_actions';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['action_id', 'name', 'hold_time'], 'required'],
            [['action_id', 'hold_time', 'type', 'cpa_link_id'], 'integer'],
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
            'action_id' => 'Action ID',
            'name' => 'Name',
            'hold_time' => 'Hold Time',
            'type' => 'Type',
            'cpa_link_id' => 'Spa Link ID',
        ];
    }

  public function getCpa()
  {
    return $this->hasOne(Cpa::className(), ['id' => 'cpa_link_id']);
  }

  public function getTariffs()
  {
    return $this->hasMany(ActionsTariffs::className(), ['id_action' => 'uid']);
  }


  public function beforeDelete()
{
    //tariffs
    $actionTariffs = ActionsTariffs::find()
        ->where(['id_action' => $this->uid])
        ->all();
    foreach ($actionTariffs as $actionTariff) {
        $actionTariff->delete();
    }
    return parent::beforeDelete();
}
}
