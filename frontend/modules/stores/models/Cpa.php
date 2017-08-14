<?php

namespace app\modules\stores\models;

use Yii;
use app\modules\stores\models\CpaLink;

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
      return $this->hasMany(CpaLink::className(), ['spa_id' => 'id']);
    }
}
