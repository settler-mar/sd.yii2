<?php

namespace frontend\modules\params\models;

use Yii;

/**
 * This is the model class for table "cw_product_parameters_values_synonyms".
 *
 * @property integer $id
 * @property integer $value_id
 * @property string $text
 * @property integer $active
 * @property string $created_at
 *
 * @property CwProductParametersValues $value
 */
class ProductParametersValuesSynonyms extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cw_product_parameters_values_synonyms';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['value_id', 'text'], 'required'],
            [['value_id', 'active'], 'integer'],
            [['created_at'], 'safe'],
            [['text'], 'string', 'max' => 255],
            [['value_id'], 'exist', 'skipOnError' => true, 'targetClass' => CwProductParametersValues::className(), 'targetAttribute' => ['value_id' => 'id']],
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
            'text' => 'Text',
            'active' => 'Active',
            'created_at' => 'Created At',
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getValue()
    {
        return $this->hasOne(CwProductParametersValues::className(), ['id' => 'value_id']);
    }
}
