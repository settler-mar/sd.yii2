<?php

namespace frontend\modules\params\models;

use Yii;
use common\components\JsonBehavior;
use shop\modules\category\models\ProductsCategory;
use shop\modules\product\models\Product;

/**
 * This is the model class for table "cw_product_parameters".
 *
 * @property integer $id
 * @property string $code
 * @property string $name
 * @property integer $active
 * @property string $created_at
 *
 * @property CwProductParametersSynonyms[] $cwProductParametersSynonyms
 * @property CwProductParametersValues[] $cwProductParametersValues
 */
class ProductParameters extends \yii\db\ActiveRecord
{
    const PRODUCT_PARAMETER_ACTIVE_YES = 1;
    const PRODUCT_PARAMETER_ACTIVE_NO = 0;
    const PRODUCT_PARAMETER_ACTIVE_WAITING = 2;

   // public $possibles_synonyms = [];
   // public $exists_synonyms = [];
    public $possible_categories = [];

    protected static $params = [];
    protected static $paramsProcessing = [];
    protected static $originalValues = [];
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cw_product_parameters';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['code', 'name'], 'required'],
            [['active','synonym'], 'integer'],
            [['created_at'], 'safe'],
            [['code', 'name'], 'string', 'max' => 255],
            [['code'], 'unique'],
            //['possibles_synonyms', 'exist', 'targetAttribute' => 'id', 'allowArray' => true],
            ['possible_categories', 'exist', 'targetAttribute' => 'id', 'allowArray' => true ,'targetClass' => ProductsCategory::className()],
            //['exists_synonyms', 'exist', 'targetAttribute' => 'id', 'allowArray' => true, 'targetClass' => ProductParametersSynonyms::className()],
            [['categories'], 'safe'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'code' => 'Code',
            'name' => 'Name',
            'active' => 'Active',
            'categories' => 'Категории',
            'synonym' => 'Является синонимом для',
            'product_categories' => 'Категории',
            'created_at' => 'Created At',
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getSynonymParam()
    {
        return $this->hasOne(self::className(), ['id' => 'synonym']);
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getValues()
    {
        return $this->hasMany(ProductParametersValues::className(), ['parameter_id' => 'id']);
    }

    public function getParamsProcessing()
    {
        return $this->hasMany(ProductParametersProcessing::className(), ['param_id' => 'id']);
    }

    public function getSynonyms()
    {
        return $this->hasMany(self::className(), ['synonym' => 'id']);
    }

    public function beforeValidate()
    {
        //ddd($this->possible_categories);
        $this->categories = !empty($this->possible_categories) ? $this->possible_categories : null;
        return parent::beforeValidate();
    }

    public function afterSave($insert, $changedAttributes)
    {
        foreach ($this->paramsProcessing as $paramProcessing) {
            //по параметрам в обработке
            $product = $paramProcessing->product;
            $product->updateParams();
        }
        return parent::afterSave($insert, $changedAttributes);
    }

    /**
     * приводим параметры и значения к стандартизованному виду
     * @param $params
     * @return array
     */
    public static function standarted($params)
    {
        $out = [];
        $processingOut = [];
        foreach ($params as $param => $values) {
            $paramStandarted = self::standartedParam((string) $param);
            if (!$paramStandarted || empty($paramStandarted['param'])) {
                //вернуло false или нет параметра
                continue;
            }
            $processing = !empty($paramStandarted['processing']);
            $param = $paramStandarted['param'];

            $standartedValues = ProductParametersValues::standartedValues($param->id, $values);
            if ($standartedValues) {
                if (!$processing) {
                    //параметр ОК - выбираем значения или в обработку, или в запись
                    foreach ($standartedValues as $value) {
                        if (empty($value['value'])) {
                            continue;
                        }
                        if (!empty($value['processing'])) {
                            //значение в процессинг
                            $processingOut[$param->id][] = $value['value'];
                        } else {
                            //значение в запись
                            $out[$param->code][] = $value['value'];
                        }
                    }
                    if (isset($out[$param->code])) {
                        $out[$param->code] = array_unique($out[$param->code]);
                    }
                } else {
                    //параметр в обработке - все значеня в обработку
                    $processingOut[$param->id] = empty($processingOut[$param->id]) ?
                        array_column($standartedValues, 'value') :
                        array_merge($processingOut[$param->id], array_column($standartedValues, 'value'));
                    $processingOut[$param->id] = array_unique($processingOut[$param->id]);
                }
            }
        }
        return [
            'params' => !empty($out) ? $out : null,//готовые в запись
            'params_processing' => $processingOut,//в обработку
        ];
    }

    public static function standartedParam($param)
    {
        //пробуем найти в памяти
        if (isset(self::$params[$param])) {
            return ['param' =>  self::$params[$param], 'processing' => false];
        }
        //и те что в процессе
        if (isset(self::$paramsProcessing[$param])) {
            return ['param' =>  self::$paramsProcessing[$param], 'processing' => true];
        }
        //проверка на стоп-слова
        if (isset(Yii::$app->params['product_params_stop_list'])) {
            foreach (Yii::$app->params['product_params_stop_list'] as $stopWord) {
                $stopWord = trim($stopWord);
                $paramCompare = substr($stopWord, -1) == '*' ? substr($param, 0, strlen($stopWord) -1).'*' : $param;
                if ($stopWord == $paramCompare) {
                    self::$params[$param] = '';
                    return false;
                }
            }
        }
        //ищем в таблице
        $out = self::findOne([
            'code'=>$param,
        ]);
        if ($out) {
            //нашли
            if ($out->synonymParam) {
                //есть синоним
                if ($out->synonymParam->active == self::PRODUCT_PARAMETER_ACTIVE_YES) {
                    //синоним активен
                    self::$params[$param] = $out->synonymParam;
                    return ['param' => $out->synonymParam, 'processing' => false];
                }
                if ($out->synonymParam->active == self::PRODUCT_PARAMETER_ACTIVE_WAITING) {
                    //синоним активен
                    self::$params[$param] = $out->synonymParam;
                    return ['param' => $out->synonymParam, 'processing' => true];
                }
                //cиноним неактивен - возращаем пусто
                self::$params[$param] = false;
                return false;
            }
            if ($out->active == self::PRODUCT_PARAMETER_ACTIVE_YES) {
                //параметр активен
                self::$params[$param] = $out;
                return ['param' => $out, 'processing' => false];
            }
            if ($out->active == self::PRODUCT_PARAMETER_ACTIVE_WAITING) {
                //параметр в ожидании
                self::$paramsProcessing[$param] = $out;
                return ['param' => $out, 'processing' => true];
            }
            //параметр неактивен - возращаем пусто
            self::$params[$param] = false;
            return false;
        }
        //если нет то создаём новый параметр
        $out = new self();
        $out->code = $param;
        $out->name = $param;
        $out->active = self::PRODUCT_PARAMETER_ACTIVE_WAITING;
        if ($out->save()) {
            self::$paramsProcessing[$param] = $out;
            return ['param' => $out, 'processing' => true];
        } else {
            d($out->errors);
            return false;
        }
    }

    public static function fromValues($originals)
    {
        $out = [];
        $originals = preg_split('/[\/,]+/', $originals);

        foreach ($originals as $original) {
            $original = trim($original);
            if (!$original) {
                continue;
            }
            //пробуем найти в памяти
            if (isset(self::$originalValues[$original])) {
                if (self::$originalValues[$original] !== false) {
                    foreach (self::$originalValues[$original] as $key => $value) {
                        $out[$key][] = $value;
                    }
                }
                continue;
            }
            $value = ProductParametersValues::findOne(['name' => $original]);
            $value = $value ? ProductParametersValues::valueSynonym($value) : false;
            if ($value && $value->active != ProductParametersValues::PRODUCT_PARAMETER_VALUES_ACTIVE_NO) {
                $parameter = self::findOne($value->parameter_id);
                $parameter = $parameter ? self::parameterSynonym($parameter) : false;
                if ($parameter && $parameter->active != self::PRODUCT_PARAMETER_ACTIVE_NO) {
                    $out[$parameter->name][] = $value->name;
                    self::$originalValues[$original] = [$parameter->name => $value->name];
                } else {
                    self::$originalValues[$original] = false;
                }
            } else {
                self::$originalValues[$original] = false;
            }
        }
        //d($out, self::$originalValues);
        return !empty($out) ? $out : null;
    }

    public static function parameterSynonym($parameter)
    {
        if ($parameter->synonymParam) {
            return self::parameterSynonym($parameter->synonymParam);
        }
        return $parameter;
    }



    public static function activeClass($active)
    {
        switch ($active) {
            case (ProductParameters::PRODUCT_PARAMETER_ACTIVE_NO):
                return 'status_1';
            case (ProductParameters::PRODUCT_PARAMETER_ACTIVE_YES):
                return 'status_2';
            default:
                return 'status_0';
        }
    }


}
