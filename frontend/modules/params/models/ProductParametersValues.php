<?php

namespace frontend\modules\params\models;

use Yii;
use common\components\JsonBehavior;
use frontend\modules\product\models\ProductsCategory;

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

    public $possibles_synonyms = [];
    public $exists_synonyms = [];

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
            [['parameter_id', 'active'], 'integer'],
            [['created_at'], 'safe'],
            [['name'], 'string', 'max' => 255],
            [['parameter_id', 'name'], 'unique', 'targetAttribute' => ['parameter_id', 'name'], 'message' => 'The combination of Parameter ID and Name has already been taken.'],
            [['parameter_id'], 'exist', 'skipOnError' => true, 'targetClass' => ProductParameters::className(), 'targetAttribute' => ['parameter_id' => 'id']],
            ['possibles_synonyms', 'exist', 'targetAttribute' => 'id', 'allowArray' => true],
            ['exists_synonyms', 'exist', 'targetAttribute' => 'id', 'allowArray' => true, 'targetClass' => ProductParametersValuesSynonyms::className()],
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
            'created_at' => 'Created At',
        ];
    }

//    public function behaviors()
//    {
//        return [
//            [
//                'class' => JsonBehavior::className(),
//                'property' => 'categories',
//                'jsonField' => 'categories'
//            ]
//        ];
//    }

    public function beforeValidate()
    {
        //ddd($this, $this->possible_categories);
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
     * @return \yii\db\ActiveQuery
     */
    public function getSynonyms()
    {
        return $this->hasMany(ProductParametersValuesSynonyms::className(), ['value_id' => 'id']);
    }

    public function afterSave($insert, $changedAttributes)
    {
        $synonyms = ProductParametersValuesSynonyms::find()->where(['value_id' => $this->id])->all();
        foreach ($synonyms as $synonym) {
            $synonym->active = in_array($synonym->id, $this->exists_synonyms) ?
                ProductParametersValuesSynonyms::PRODUCT_PARAMETER_VALUES_SYNONYM_ACTIVE_YES :
                ProductParametersValuesSynonyms::PRODUCT_PARAMETER_VALUES_SYNONYM_ACTIVE_NO;
            $synonym->save();
        }
        if (!empty($this->possibles_synonyms)) {
            $possibles = self::find()->where(['id' => $this->possibles_synonyms])->all();
            foreach ($possibles as $possible) {
                $possible->active = self::PRODUCT_PARAMETER_VALUES_ACTIVE_NO;
                $possible->save();
                $synonym = ProductParametersValuesSynonyms::find()->where(['text'=>$possible->name])->one();
                if (!$synonym) {
                    $synonym = new ProductParametersValuesSynonyms();
                    $synonym->value_id = $this->id;
                    $synonym->text = $possible->name;
                    $synonym->active = ProductParametersValuesSynonyms::PRODUCT_PARAMETER_VALUES_SYNONYM_ACTIVE_YES;
                    $synonym->save();
                }
            }
        }
        return parent::afterSave($insert, $changedAttributes);
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
                $result[] = self::$values[$paramId][$value];
                continue;
            }
            //ищем в таблице
            $out = self::findOne([
                'name' => $value,
                'parameter_id' => $paramId,
                'active' => [self::PRODUCT_PARAMETER_VALUES_ACTIVE_YES, self::PRODUCT_PARAMETER_VALUES_ACTIVE_WAITING]
            ]);
            if ($out) {
                self::$values[$paramId][$value] = $out->name;
                $result[] =  $out->name;
                continue;
            }
            //ищем синонимах
            $synonym = ProductParametersValuesSynonyms::findOne([
                'text' => $value,
                'active' => [
                    ProductParametersValuesSynonyms::PRODUCT_PARAMETER_VALUES_SYNONYM_ACTIVE_YES,
                    ProductParametersValuesSynonyms::PRODUCT_PARAMETER_VALUES_SYNONYM_ACTIVE_WAITING
                ]
            ]);
            if ($synonym) {
                //есть синоним, ищем от чего синоним
                $out = self::findOne([
                    'id' => $synonym->value_id, 'active' =>[
                        self::PRODUCT_PARAMETER_VALUES_ACTIVE_YES,
                        self::PRODUCT_PARAMETER_VALUES_ACTIVE_WAITING
                    ]]);
                if ($out) {
                    self::$values[$paramId][$value] = $out->name;
                    $result[] = $out->name;
                    continue;
                }
            }
            //нет нигде, пишем значение
            $out = new self();
            $out->name = $value;
            $out->parameter_id = $paramId;
            $out->active = self::PRODUCT_PARAMETER_VALUES_ACTIVE_WAITING;
            if ($out->save()) {
                self::$values[$paramId][$value] = $out->name;
            } else {
                d($out->errors);
            }
            self::$values[$paramId][$value] = $out->name;
            $result[] =  $out->name;
        }
        return $result;
    }
}
