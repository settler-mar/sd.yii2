<?php

namespace frontend\modules\params\models;

use Yii;
use common\components\JsonBehavior;
use shop\modules\category\models\ProductsCategory;
use frontend\modules\params\models\ProductParametersProcessing;

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

    public $possible_categories = [];

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
            [['parameter_id', 'active', 'synonym'], 'integer'],
            [['created_at'], 'safe'],
            [['name'], 'string', 'max' => 255],
            [['parameter_id', 'name'], 'unique', 'targetAttribute' => ['parameter_id', 'name'], 'message' => 'The combination of Parameter ID and Name has already been taken.'],
            [['parameter_id'], 'exist', 'skipOnError' => true, 'targetClass' => ProductParameters::className(), 'targetAttribute' => ['parameter_id' => 'id']],
            //['possibles_synonyms', 'exist', 'targetAttribute' => 'id', 'allowArray' => true],
            //['exists_synonyms', 'exist', 'targetAttribute' => 'id', 'allowArray' => true, 'targetClass' => ProductParametersValuesSynonyms::className()],
            [['categories'], 'safe'],
            ['possible_categories', 'exist', 'targetAttribute' => 'id', 'allowArray' => true ,'targetClass' => ProductsCategory::className()],
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
            'product_categories' => 'Категории',
            'synonym' => 'Является синонимом для',
            'created_at' => 'Created At',
        ];
    }

    public function beforeValidate()
    {
        $this->categories = !empty($this->possible_categories) ? $this->possible_categories : null;
        return parent::beforeValidate();
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getParameter()
    {
        return $this->hasOne(ProductParameters::className(), ['id' => 'parameter_id']);
    }

    /**
     * является синонимом для
     * @return \yii\db\ActiveQuery
     */
    public function getSynonymValue()
    {
        return $this->hasOne(self::className(), ['id' => 'synonym']);
    }

    /**синонимы значения
     * @return \yii\db\ActiveQuery
     */
    public function getSynonyms()
    {
        return $this->hasMany(ProductParametersValues::className(), ['synonym' => 'id']);
    }

    /**
     * значения параметров в обработке
     * @return \yii\db\ActiveQuery
     */
    public function getProcessingParamters()
    {
        return $this->hasMany(ProductParametersProcessing::className(), ['value_id' =>'id']);
    }

    public function afterSave($insert, $changedAttributes)
    {
        //параметры в обработке свои, синонимов или для кого является синонимом
        $synonymVal = $this->synonymValue;
        if (!$synonymVal && !empty($changedAttributes['synonym'])) {
            $synonymVal = self::findOne($changedAttributes['synonym']);
        }
        $paramsProcessing = $this->processingParamters ? $this->processingParamters : [];
        if ($synonymVal  && $synonymVal->processingParamters) {
            $paramsProcessing = array_merge($paramsProcessing, $synonymVal->processingParamters);
        }
        if ($this->synonyms) {
            foreach ($this->synonyms as $synonym) {
                if ($synonym->rocessingParamters) {
                    $paramsProcessing = array_merge($paramsProcessing, $synonym->processingParamters);
                }
            }
        }
        //ddd($paramsProcessing, $synonymVal);
        foreach ($paramsProcessing as $paramProcessing) {
            //по параметрам в обработке
            $product = $paramProcessing->product;
            $product->updateParams();
        }
        return parent::afterSave($insert, $changedAttributes);
    }

    /**
     * @param $paramId
     * @param $values
     * @return array [..[(string|inteder)'value', (bool) 'processing']..]
     */
    public static function standartedValues($paramId, $values)
    {
        //на входе массив значений
        $result = [];
        foreach ($values as $value) {
            $value = (string) $value;
            //по каждому элементу
            //проверка на максимальную длину
            if (mb_strlen($value) > Yii::$app->params['product_params_values_max_length']) {
                //self::$values[$paramId][$value] = false;
                continue;
            }
            //ищем в таблице
            $out = self::findOne([
                'name' => $value,
                'parameter_id' => $paramId,
            ]);
            if ($out) {
                //нашли
                if ($out->synonymValue) {
                    //имеется синоним
                    if ($out->synonymValue->active == ProductParametersValues::PRODUCT_PARAMETER_VALUES_ACTIVE_YES) {
                        //синоним активен
                        $result[] = ['value' => $out->synonymValue->name, 'processing' => false];
                        unset($out->synonymValue);
                        unset($out);
                        continue;
                    }
                    if ($out->synonymValue->active !== ProductParametersValues::PRODUCT_PARAMETER_VALUES_ACTIVE_WAITING) {
                        //синоним в ожидании
                        $result[] = ['value' => $out->synonymValue->id, 'processing' => true];
                        unset($out->synonymValue);
                        unset($out);
                        continue;
                    }
                    //если неактивен то false
                    continue;
                }
                //нет синонима
                if ($out->active == ProductParametersValues::PRODUCT_PARAMETER_VALUES_ACTIVE_YES) {
                    //само значение активно
                    $result[] = ['value' => $out->name, 'processing' => false];
                    unset($out);
                    continue;
                }
                if ($out->active == ProductParametersValues::PRODUCT_PARAMETER_VALUES_ACTIVE_WAITING) {
                    //само значение в ожидании
                    $result[] = ['value' => $out->id, 'processing' => true];
                    unset($out);
                    continue;
                }
                //если неактивен то false
                continue;
            }
            //нет нигде, пишем значение
            $out = null;
            $out = new self();
            $out->name = $value;
            $out->parameter_id = $paramId;
            $out->active = self::PRODUCT_PARAMETER_VALUES_ACTIVE_WAITING;
            if ($out->save()) {
                $result[] =  ['value' => $out->id, 'processing' => true];
            } else {
                d($out->errors);
            }
            unset($out);
            $value = null;
        }
        return $result;
    }

    public static function valueSynonym($value)
    {
        if ($value->synonymValue) {
            return self::valueSynonym($value->synonymValue);
        }
        return $value;
    }

    public static function activeClass($active)
    {
        switch ($active) {
            case (self::PRODUCT_PARAMETER_VALUES_ACTIVE_NO):
                return 'status_1';
            case (self::PRODUCT_PARAMETER_VALUES_ACTIVE_YES):
                return 'status_2';
            default:
                return 'status_0';
        }
    }

    public static function byName($name, $paramId)
    {
        return self::findOne(['name' => $name, 'parameter_id' => $paramId]);
    }
}
