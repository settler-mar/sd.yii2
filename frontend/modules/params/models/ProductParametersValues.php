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
    const PRODUCT_PARAMETER_VALUES_ACTIVE_YES = 1;
    const PRODUCT_PARAMETER_VALUES_ACTIVE_NO = 0;
    const PRODUCT_PARAMETER_VALUES_ACTIVE_WAITING = 2;

    protected static $values = [];
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
            [['parameter_id', 'name'], 'unique', 'targetAttribute' => ['parameter_id', 'name'], 'message' => 'The combination of Parameter ID and Name has already been taken.'],
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
            'parameter_id' => 'Параметр',
            'name' => 'Значение',
            'active' => 'Активен',
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

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getSynonyms()
    {
        return $this->hasMany(ProductParametersValuesSynonyms::className(), ['value_id' => 'id']);
    }

    public static function standartedValue($paramId, $value)
    {
        if (isset(self::$values[$paramId][$value])) {
            return self::$values[$paramId][$value];
        }
        $out = self::findOne([
            'name'=>$value,
            'parameter_id' => $paramId,
            'active' => [self::PRODUCT_PARAMETER_VALUES_ACTIVE_YES, self::PRODUCT_PARAMETER_VALUES_ACTIVE_WAITING]
        ]);
        if ($out) {
            self::$values[$paramId][$value] = $out->name;
            return $out->name;
        }
        $synonym = ProductParametersValuesSynonyms::findOne([
            'text' => $value,
            'active'=> ProductParametersValuesSynonyms::PRODUCT_PARAMETER_VALUES_SYNONYM_ACTIVE_YES
        ]);
        if ($synonym) {
            $out = self::findOne([
                'id'=>$synonym->value_id, 'active' => self::PRODUCT_PARAMETER_VALUES_ACTIVE_YES]);
            self::$values[$paramId][$value] = $out->name;
            return $out->name;
        }
        $out = new self();
        $out->name = $value;
        $out->parameter_id = $paramId;
        $out->active = self::PRODUCT_PARAMETER_VALUES_ACTIVE_WAITING;
        if ($out->save()) {
            self::$values[$value] = $out->name;
        } else {
            d($out->errors);
        }
        self::$values[$paramId][$value] = $out->name;
        return $out->name;
    }
}
