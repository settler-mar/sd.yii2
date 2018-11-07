<?php

namespace frontend\modules\params\models;

use Yii;
use common\components\JsonBehavior;
use shop\modules\category\models\ProductsCategory;

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

    //public $possibles_synonyms = [];
    //public $exists_synonyms = [];

    public $possible_categories = [];

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

    public static function standartedValues($paramId, $values)
    {
        //на входе массив значений
        $result = [];
        foreach ($values as $value) {
            $value = (string) $value;
            //по каждому элементу
            //пробуем найти в памяти
            if (isset(self::$values[$paramId][$value])) {
                if (self::$values[$paramId][$value] !== false) {
                    $result[] = self::$values[$paramId][$value];
                }
                continue;
            }
            //проверка на максимальную длину
            if (mb_strlen($value) > Yii::$app->params['product_params_values_max_length']) {
                self::$values[$paramId][$value] = '';
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
                    if ($out->synonymValue->active !== ProductParametersValues::PRODUCT_PARAMETER_VALUES_ACTIVE_NO) {
                        //синоним активен
                        self::$values[$paramId][$value] = $out->synonymValue->name;
                        $result[] = $out->synonymValue->name;
                        continue;
                    }
                    //если неактивен то false
                    self::$values[$paramId][$value] = false;
                    continue;
                }
                //нет синонима
                if ($out->active !== ProductParametersValues::PRODUCT_PARAMETER_VALUES_ACTIVE_NO) {
                    //само значение активно
                    self::$values[$paramId][$value] = $out->name;
                    $result[] = $out->name;
                    continue;
                }
                //если неактивен то false
                self::$values[$paramId][$value] = false;
                continue;
            }
            //нет нигде, пишем значение
            $out = new self();
            $out->name = $value;
            $out->parameter_id = $paramId;
            $out->active = self::PRODUCT_PARAMETER_VALUES_ACTIVE_WAITING;
            if ($out->save()) {
                self::$values[$paramId][$value] = $out->name;
                $result[] =  $out->name;
            } else {
                d($out->errors);
            }

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
}
