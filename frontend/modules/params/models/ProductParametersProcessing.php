<?php

namespace frontend\modules\params\models;

use yii;
use frontend\modules\product\models\Product;

/**
 * This is the model class for table "cw_product_parameters_processing".
 *
 * @property integer $id
 * @property integer $product_id
 * @property integer $param_id
 * @property string $value
 *
 * @property CwProductParameters $param
 * @property CwProduct $product
 */
class ProductParametersProcessing extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cw_product_parameters_processing';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['product_id', 'param_id', 'value_id'], 'required'],
            [['product_id', 'param_id','value_id'], 'integer'],
            [['param_id'], 'exist', 'skipOnError' => true, 'targetClass' => ProductParameters::className(), 'targetAttribute' => ['param_id' => 'id']],
            [['product_id'], 'exist', 'skipOnError' => true, 'targetClass' => Product::className(), 'targetAttribute' => ['product_id' => 'id']],
            [['value_id'], 'exist', 'skipOnError' => true, 'targetClass' => ProductParametersValues::className(), 'targetAttribute' => ['value_id' => 'id']],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'product_id' => 'Product ID',
            'param_id' => 'Param ID',
            'value_id' => 'Value ID',
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getParam()
    {
        return $this->hasOne(ProductParameters::className(), ['id' => 'param_id']);
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getProduct()
    {
        return $this->hasOne(Product::className(), ['id' => 'product_id']);
    }

    /**
     * @return yii\db\ActiveQuery
     */
    public function getParametersProcessing()
    {
        return $this->hasMany(ProductParametersValues::className(), ['id' => 'value_id']);
    }
}
