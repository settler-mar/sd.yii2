<?php

namespace frontend\modules\params\models;

use Yii;

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

    public $possibles_synonyms = [];
    public $exists_synonyms = [];

    protected static $params = [];
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
            [['active'], 'integer'],
            [['created_at'], 'safe'],
            [['code', 'name'], 'string', 'max' => 255],
            [['code'], 'unique'],
            ['possibles_synonyms', 'exist', 'targetAttribute' => 'id', 'allowArray' => true],
            ['exists_synonyms', 'exist', 'targetAttribute' => 'id', 'allowArray' => true, 'targetClass' => ProductParametersSynonyms::className()]
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
            'created_at' => 'Created At',
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getSynonyms()
    {
        return $this->hasMany(ProductParametersSynonyms::className(), ['parameter_id' => 'id']);
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getValues()
    {
        return $this->hasMany(ProductParametersValues::className(), ['parameter_id' => 'id']);
    }

    public function afterSave($insert, $changedAttributes)
    {
        $synonyms = ProductParametersSynonyms::find()->where(['parameter_id' => $this->id])->all();
        foreach ($synonyms as $synonym) {
            $synonym->active = in_array($synonym->id, $this->exists_synonyms) ?
                ProductParametersSynonyms::PRODUCT_PARAMETER_SYNONYM_ACTIVE_YES :
                ProductParametersSynonyms::PRODUCT_PARAMETER_SYNONYM_ACTIVE_NO;
            $synonym->save();
        }
        if (!empty($this->possibles_synonyms)) {
            $possibles = self::find()->where(['id' => $this->possibles_synonyms])->all();
            foreach ($possibles as $possible) {
                $possible->active = self::PRODUCT_PARAMETER_ACTIVE_NO;
                $possible->save();
                $synonym = ProductParametersSynonyms::find()->where(['text'=>$possible->code])->one();
                if (!$synonym) {
                    $synonym = new ProductParametersSynonyms();
                    $synonym->parameter_id = $this->id;
                    $synonym->text = $possible->code;
                    $synonym->active = ProductParametersSynonyms::PRODUCT_PARAMETER_SYNONYM_ACTIVE_YES;
                    $synonym->save();
                }
            }
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
        foreach ($params as $param => $value) {
            $paramStandarted = self::standartedParam($param);
            $out[$paramStandarted->code] = ProductParametersValues::standartedValue($paramStandarted->id, $value);
        }
        return $out;
    }

    public static function standartedParam($param)
    {
        if (isset(self::$params[$param])) {
            return self::$params[$param];
        }
        $out = self::findOne([
            'code'=>$param,
            'active' => [self::PRODUCT_PARAMETER_ACTIVE_YES, self::PRODUCT_PARAMETER_ACTIVE_WAITING]
        ]);
        if ($out) {
            self::$params[$param] = $out;
            return $out;
        }
        $synonym = ProductParametersSynonyms::findOne([
            'text' => $param,
            'active'=> ProductParametersSynonyms::PRODUCT_PARAMETER_SYNONYM_ACTIVE_YES
        ]);
        if ($synonym) {
            $out = self::findOne(['id'=>$synonym->parameter_id, 'active' => self::PRODUCT_PARAMETER_ACTIVE_YES]);
            self::$params[$param] = $out;
            return $out;
        }
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


}
