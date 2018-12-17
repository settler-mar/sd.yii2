<?php

namespace frontend\modules\params\models;

use Yii;

/**
 * This is the model class for table "lg_product_parameters".
 *
 * @property integer $id
 * @property integer $parameter_id
 * @property string $language
 * @property string $name
 *
 * @property CwProductParameters $parameter
 */
class LgProductParameters extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'lg_product_parameters';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['parameter_id', 'language'], 'required'],
            [['name'], 'required', 'enableClientValidation' => false],
            [['parameter_id'], 'integer'],
            [['language'], 'string', 'max' => 10],
            [['name'], 'string', 'max' => 255],
            [['parameter_id', 'language'], 'unique', 'targetAttribute' => ['parameter_id', 'language'], 'message' => 'The combination of Parameter ID and Language has already been taken.'],
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
            'language' => 'Language',
            'name' => 'Название',
        ];
    }

    public function formName()
    {
        return 'ProductParameters_'.$this->language;
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getParameter()
    {
        return $this->hasOne(ProductParameters::className(), ['id' => 'parameter_id']);
    }
}
