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
    const PRODUCT_PARAMETER_VALUES_SYNONYM_ACTIVE_YES = 1;
    const PRODUCT_PARAMETER_VALUES_SYNONYM_ACTIVE_NO = 0;
    const PRODUCT_PARAMETER_VALUES_SYNONYM_ACTIVE_WAITING = 2;
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
            [['value_id', 'text'], 'unique', 'targetAttribute' => ['value_id', 'text'], 'message' => 'The combination of Value ID and Text has already been taken.'],
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
        return $this->hasOne(ProductParametersValues::className(), ['id' => 'value_id']);
    }
}
