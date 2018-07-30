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
     * имя параметра id юсера для разных спа
     * @var array
     */
    public static $user_id_params = [
        'Admitad' =>'subid',
        'Shareasale' => 'afftrack',
        'Sellaction' => 'SubID1',
        'Doublertrade' => 'epi',
        'Advertise'=> 'tid',
        "Linkconnector"=>'atid'
    ];

    /**
     * для таких спа subid подставляется в шаблоне
     * @var array
     */
    public static $user_id_in_template = ['Внешние подключения', 'Cj.com'];

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
            [['auto_close'], 'integer'],
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
