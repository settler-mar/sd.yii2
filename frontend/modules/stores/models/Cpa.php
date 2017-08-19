<?php

namespace frontend\modules\stores\models;

use Yii;
use frontend\modules\stores\models\CpaLink;
use frontend\modules\stores\models\StoresActions;

/**
 * This is the model class for table "cw_cpa".
 *
 * @property integer $id
 * @property string $name
 */
class Cpa extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cw_cpa';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['name'], 'required'],
            [['name'], 'string', 'max' => 20],
            [['name'], 'unique'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'name' => 'Name',
        ];
    }

    public function getCpaLink()
    {
      return $this->hasMany(CpaLink::className(), ['cpa_id' => 'id']);
    }

    public function getActions()
    {
      return $this->hasMany(StoresActions::className(), ['cpa_link_id' => 'id']);
    }
}
