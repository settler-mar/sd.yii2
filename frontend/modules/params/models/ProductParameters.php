<?php

namespace frontend\modules\params\models;

use Yii;
use common\components\JsonBehavior;
use shop\modules\category\models\ProductsCategory;

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

    /**
     * приводим параметры и значения к стандартизованному виду
     * @param $params
     * @return array
     */
    public static function standarted($params)
    {
        $out = [];
        foreach ($params as $param => $values) {
            $paramStandarted = self::standartedParam((string) $param);
            if ($paramStandarted) {
                $standartedValues = ProductParametersValues::standartedValues($paramStandarted->id, $values);
                if ($standartedValues) {
                    $out[$paramStandarted->code] = empty($out[$paramStandarted->code]) ? $standartedValues:
                        array_merge($out[$paramStandarted->code], $standartedValues);
                    $out[$paramStandarted->code] = array_unique($out[$paramStandarted->code]);
                }
            }
        }
        return $out;
    }

    public static function standartedParam($param)
    {
        //пробуем найти в памяти
        if (isset(self::$params[$param])) {
            return self::$params[$param];
        }
        //проверка на стоп-слова
        if (isset(Yii::$app->params['product_params_stop_list'])) {
            foreach (Yii::$app->params['product_params_stop_list'] as $stopWord) {
                $stopWord = trim($stopWord);
                $paramCompare = substr($stopWord, -1) == '*' ? substr($param, 0, strlen($stopWord) -1).'*' : $param;
                if ($stopWord == $paramCompare) {
                    self::$params[$param] = '';
                    return '';
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
                if ($out->synonymParam->active !== self::PRODUCT_PARAMETER_ACTIVE_NO) {
                    //синоним активен
                    self::$params[$param] = $out->synonymParam;
                    return $out->synonymParam;
                }
                //cиноним неактивен - возращаем пусто
                self::$params[$param] = false;
                return false;
            }
            if ($out->active !== self::PRODUCT_PARAMETER_ACTIVE_NO) {
                //параметр активен
                self::$params[$param] = $out;
                return $out;
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
            self::$params[$param] = $out;
        } else {
            d($out->errors);
        }
        return $out;
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
