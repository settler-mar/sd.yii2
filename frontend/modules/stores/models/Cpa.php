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
        'Admitad-prod' =>'subid',
        'Shareasale' => 'afftrack',
        'Sellaction' => 'SubID1',
        'Doublertrade' => 'epi',
        'Advertise'=> 'tid',
        'Awin' => 'clickref',//такой вариант
        //'Awin' => 'pref1',//второй вариант
        "Linkconnector"=>'atid',
        'Cj.com' => 'sid',
        'Webgains' => 'clickref',
        'Impact' => 'subId1',
        'Connexity' => false, //для продуктов при фалсе вообще не добавляем параметр, если null или нет в настройке, то subid

    ];

    /**
     * для таких спа subid подставляется в шаблоне
     * @var array
     */
    public static $user_id_in_template = ['Внешние подключения'];

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

    public function productClickUrl($productUrl, $userId = false)
    {
        $paramName = isset(self::$user_id_params[$this->name])
            ? self::$user_id_params[$this->name] : null;
        if ($paramName === false) {
            return $productUrl;
        }
        $paramName = $paramName ? $paramName : 'subid';
        $userId = $userId ? $userId : (Yii::$app->user->isGuest ? 0 : Yii::$app->user->id);

        return $productUrl . (strpos($productUrl, '?') === false ? '?' : '&') . $paramName . '=' . $userId;
    }
}
