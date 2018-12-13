<?php

namespace frontend\modules\params\models;

use Yii;

/**
 * This is the model class for table "lg_product_parameters_values".
 *
 * @property integer $id
 * @property integer $value_id
 * @property string $language
 * @property string $name
 *
 * @property CwProductParametersValues $value
 */
class LgProductParametersValues extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'lg_product_parameters_values';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['value_id', 'language', 'name'], 'required'],
            [['value_id'], 'integer'],
            [['language'], 'string', 'max' => 10],
            [['name'], 'string', 'max' => 255],
            [['value_id', 'language'], 'unique', 'targetAttribute' => ['value_id', 'language'], 'message' => 'The combination of Value ID and Language has already been taken.'],
            [['value_id'], 'exist', 'skipOnError' => true, 'targetClass' => ProductParametersValues::className(), 'targetAttribute' => ['value_id' => 'id']],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'value_id' => 'Value ID',
            'language' => 'Language',
            'name' => 'Название',
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getValue()
    {
        return $this->hasOne(ProductParametersValues::className(), ['id' => 'value_id']);
    }

    public function formName()
    {
        return 'ProductParametersValues_'.$this->language;
    }
}
