<?php

namespace frontend\modules\params\models;

use Yii;

/**
 * This is the model class for table "cw_product_parameters_values".
 *
 * @property integer $id
 * @property integer $parameter_id
 * @property string $name
 * @property integer $active
 * @property string $created_at
 *
 * @property CwProductParameters $parameter
 * @property CwProductParametersValuesSynonyms[] $cwProductParametersValuesSynonyms
 */
class ProductParametersValues extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cw_product_parameters_values';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['parameter_id', 'name'], 'required'],
            [['parameter_id', 'active'], 'integer'],
            [['created_at'], 'safe'],
            [['name'], 'string', 'max' => 255],
            [['parameter_id'], 'exist', 'skipOnError' => true, 'targetClass' => CwProductParameters::className(), 'targetAttribute' => ['parameter_id' => 'id']],
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
            'name' => 'Name',
            'active' => 'Active',
            'created_at' => 'Created At',
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getParameter()
    {
        return $this->hasOne(CwProductParameters::className(), ['id' => 'parameter_id']);
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getCwProductParametersValuesSynonyms()
    {
        return $this->hasMany(CwProductParametersValuesSynonyms::className(), ['value_id' => 'id']);
    }
}
