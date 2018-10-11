<?php

namespace frontend\modules\params\models;

use Yii;

/**
 * This is the model class for table "cw_product_parameters_synonyms".
 *
 * @property integer $id
 * @property integer $parameter_id
 * @property string $text
 * @property integer $active
 * @property string $created_at
 *
 * @property CwProductParameters $parameter
 */
class ProductParametersSynonyms extends \yii\db\ActiveRecord
{
    const PRODUCT_PARAMETER_SYNONYM_ACTIVE_YES = 1;
    const PRODUCT_PARAMETER_SYNONYM_ACTIVE_NO = 0;
    const PRODUCT_PARAMETER_SYNONYM_ACTIVE_WAITING = 2;
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cw_product_parameters_synonyms';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['parameter_id', 'text'], 'required'],
            [['parameter_id', 'active'], 'integer'],
            [['created_at'], 'safe'],
            [['text'], 'string', 'max' => 255],
            [['parameter_id', 'text'], 'unique', 'targetAttribute' => ['parameter_id', 'text'], 'message' => 'The combination of Parameter ID and Text has already been taken.'],
            [['parameter_id'], 'exist', 'skipOnError' => true, 'targetClass' => ProductParameters::className(), 'targetAttribute' => ['parameter_id' => 'id']],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'parameter_id' => 'Parameter ID',
            'text' => 'Text',
            'active' => 'Active',
            'created_at' => 'Created At',
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getParameter()
    {
        return $this->hasOne(ProductParameters::className(), ['id' => 'parameter_id']);
    }
}
