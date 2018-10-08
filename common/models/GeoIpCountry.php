<?php

namespace common\models;

use Yii;
use yii\helpers\ArrayHelper;

/**
 * This is the model class for table "geo_ip_country".
 *
 * @property integer $ip_from_int
 * @property integer $ip_to_int
 * @property string $ip_from
 * @property string $ip_to
 * @property string $code
 * @property string $country
 */
class GeoIpCountry extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'geo_ip_country';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['ip_from_int', 'ip_to_int', 'ip_from', 'ip_to', 'code', 'country'], 'required'],
            [['ip_from_int', 'ip_to_int'], 'integer'],
            [['ip_from', 'ip_to'], 'string', 'max' => 15],
            [['code'], 'string', 'max' => 2],
            [['country'], 'string', 'max' => 64],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'ip_from_int' => 'Ip From Int',
            'ip_to_int' => 'Ip To Int',
            'ip_from' => 'Ip From',
            'ip_to' => 'Ip To',
            'code' => 'Code',
            'country' => 'Country',
        ];
    }

    /**
     * @param $ip
     * @return array|false
     * @throws \yii\db\Exception
     */
    public static function byIp($ip)
    {
        return Yii::$app->db
            ->createCommand("SELECT `code`, `country` FROM `".self::tableName()."` WHERE `ip_to_int` >= INET_ATON('".$ip."') ORDER BY `ip_to_int` ASC LIMIT 1")
            //->createCommand("SELECT * FROM `".self::tableName()."` WHERE `ip_to_int` >= INET_ATON('".$ip."') ORDER BY `ip_to_int` ASC LIMIT 1")
            ->queryOne();
    }

    public static function countryList()
    {
        return ArrayHelper::map(
            self::find()
                ->select(['code', 'country'])
                ->groupBy(['code', 'country'])
                ->orderBy(['country' => SORT_ASC])
                ->asArray()
                ->all(),
            'code',
            'country'
        );
    }
    public static function countryName($code)
    {
        $row = self::find()->select(['country'])->where(['code'=>$code])->asArray()->one();
        return $row ? $row['country'] : '';
    }
}
