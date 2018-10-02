<?php

namespace frontend\modules\country\models;

use Yii;

/**
 * This is the model class for table "cw_country_to_language".
 *
 * @property integer $id
 * @property string $country
 * @property string $region
 * @property string $language
 */
class CountryToLanguage extends \yii\db\ActiveRecord
{
    public $languages = [];
    public $regions = [];
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cw_country_to_language';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['country', 'region', 'language'], 'required'],
            [['country', 'language'], 'string', 'max' => 2],
            [['region'], 'string', 'max' => 255],
            [['country'], 'unique'],
            [['language'],'in', 'range' => array_keys($this->languages)],
            [['region'],'in', 'range' => array_keys($this->regions)],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'country' => 'Страна',
            'region' => 'Регион',
            'language' => 'Язык',
        ];
    }

    public function init()
    {
        foreach (Yii::$app->params['language_list'] as $key => $item) {
            $this->languages[substr($key, 0, 2)] = $item;
        }
        foreach (Yii::$app->params['regions_list'] as $key => $item) {
            $this->regions[$key] = $item['name'];
        }
    }
}
