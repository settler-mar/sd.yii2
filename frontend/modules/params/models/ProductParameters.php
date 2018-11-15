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
 * @property  $categories
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
            //[['code'], 'unique'],
            //['possibles_synonyms', 'exist', 'targetAttribute' => 'id', 'allowArray' => true],
            ['possible_categories', 'exist', 'targetAttribute' => 'id', 'allowArray' => true ,'targetClass' => ProductsCategory::className()],
            //['exists_synonyms', 'exist', 'targetAttribute' => 'id', 'allowArray' => true, 'targetClass' => ProductParametersSynonyms::className()],
            [['category_id'], 'integer'],
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
            'category_id' => 'Категория',
            'synonym' => 'Является синонимом для',
            'product_categories' => 'Категории',
            'created_at' => 'Created At',
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

    public function getCategory()
    {
        return $this->hasOne(ProductsCategory::className(), ['id' => 'category_id']);
    }

    public function afterSave($insert, $changedAttributes)
    {
        //параметры в обработке свои, синонимов или для кого является синонимом
        $synonymParam = $this->synonymParam;
        if (!$synonymParam && !empty($changedAttributes['synonym'])) {
            $synonymParam = self::findOne($changedAttributes['synonym']);
        }
        $paramsProcessing = $this->paramsProcessing ? $this->paramsProcessing : [];
        if ($synonymParam && $synonymParam->paramsProcessing) {
            $paramsProcessing = array_merge($paramsProcessing, $synonymParam->paramsProcessing);
        }
        if ($this->synonyms) {
            foreach ($this->synonyms as $synonym) {
                if ($synonym->paramsProcessing) {
                    $paramsProcessing = array_merge($paramsProcessing, $synonym->paramsProcessing);
                }
            }
        }
        foreach ($paramsProcessing as $paramProcessing) {
            //по параметрам в обработке
            $product = $paramProcessing->product;
            $product->updateParams();
        }
        return parent::afterSave($insert, $changedAttributes);
    }
    public function getCategoryTree()
    {
        $out = array();
        if ($this->category) {
            $categories = ProductsCategory::parents([$this->category]);
            for ($i = count($categories) - 1; $i >= 0; $i--) {
                $out[] = $categories[$i]->name;
            }
        }
        return implode(' / ', $out);
    }


    /**
     * приводим параметры и значения к стандартизованному виду
     * @param $params
     * @return array
     */
    public static function standarted($params, $categories = false)
    {
        //$categoriesString = $categories ? implode('.', $categories) . '|' : '';
        $out = [];
        $processingOut = [];
        foreach ($params as $paramKey => $values) {
            $paramStandarted = self::standartedParam((string) $paramKey, $categories);
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

    public static function standartedParam($param, $categories = false)
    {
        $categoriesString = $categories ? implode('.', $categories) . '|' : '';
        //пробуем найти в памяти
        if (isset(self::$params[$categoriesString.$param])) {
            return ['param' =>  self::$params[$categoriesString.$param], 'processing' => false];
        }
        //и те что в процессе
        if (isset(self::$paramsProcessing[$categoriesString.$param])) {
            return ['param' =>  self::$paramsProcessing[$categoriesString.$param], 'processing' => true];
        }
        //проверка на стоп-слова
        if (isset(Yii::$app->params['product_params_stop_list'])) {
            foreach (Yii::$app->params['product_params_stop_list'] as $stopWord) {
                $stopWord = trim($stopWord);
                $paramCompare = substr($stopWord, -1) == '*' ? substr($param, 0, strlen($stopWord) -1).'*' : $param;
                if ($stopWord == $paramCompare) {
                    self::$params[$categoriesString.$param] = '';
                    return false;
                }
            }
        }
        //ищем в таблице
        //последовательно по категориям сверху вниз
        if ($categories) {
            foreach ($categories as $category) {
                $out = self::find()->where(['code'=>$param, 'category_id'=> $category])->one();
            }
        } else {
            $out = self::findOne(['code'=>$param, 'category_id' => null]);
        }
        if ($out) {
            //нашли
            if ($out->synonymParam) {
                //есть синоним
                if ($out->synonymParam->active == self::PRODUCT_PARAMETER_ACTIVE_YES) {
                    //синоним активен
                    self::$params[$categoriesString.$param] = $out->synonymParam;
                    return ['param' => $out->synonymParam, 'processing' => false];
                }
                if ($out->synonymParam->active == self::PRODUCT_PARAMETER_ACTIVE_WAITING) {
                    //синоним активен
                    self::$params[$categoriesString.$param] = $out->synonymParam;
                    return ['param' => $out->synonymParam, 'processing' => true];
                }
                //cиноним неактивен - возращаем пусто
                self::$params[$categoriesString.$param] = false;
                return false;
            }
            if ($out->active == self::PRODUCT_PARAMETER_ACTIVE_YES) {
                //параметр активен
                self::$params[$categoriesString.$param] = $out;
                return ['param' => $out, 'processing' => false];
            }
            if ($out->active == self::PRODUCT_PARAMETER_ACTIVE_WAITING) {
                //параметр в ожидании
                self::$paramsProcessing[$categoriesString.$param] = $out;
                return ['param' => $out, 'processing' => true];
            }
            //параметр неактивен - возращаем пусто
            self::$params[$categoriesString.$param] = false;
            return false;
        }
        //если нет то создаём новый параметр
        $out = new self();
        $out->load(['ProductParameters' => [
            'code' => $param,
            'name' => $param,
            'category_id' => $categories ? $categories[count($categories) -1] : null,
            'active' => self::PRODUCT_PARAMETER_ACTIVE_WAITING,
        ]]);
        if ($out->save()) {
            self::$paramsProcessing[$categoriesString.$param] = $out;
            return ['param' => $out, 'processing' => true];
        } else {
            d($out->errors);
            return false;
        }
    }

    public static function fromValues($originals, $categories = '')
    {
        $out = [];
        $originals = preg_split('/[\/,]+/', $originals);

        foreach ($originals as $original) {
            $original = trim($original);
            if (!$original) {
                continue;
            }
            //пробуем найти в памяти
            if (isset(self::$originalValues[$categories . $original])) {
                if (self::$originalValues[$categories . $original] !== false) {
                    foreach (self::$originalValues[$categories . $original] as $key => $value) {
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
                    $out[$categories . $parameter->name][] = $value->name;
                    self::$originalValues[$categories . $original] = [$categories .$parameter->name => $value->name];
                } else {
                    self::$originalValues[$categories . $original] = false;
                }
            } else {
                self::$originalValues[$categories . $original] = false;
            }
        }
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
