<?php

namespace frontend\components;

use yii\base\Object;
use frontend\components\ProcessParams as ParamsProcessing;
use frontend\modules\product\models\Product;

class ProcessParams extends Object implements \yii\queue\Job
{

    public $parameter_id;
    public $value_id;


    public function execute($queue)
    {
        if ($this->parameter_id) {
            $where = ['param_id' => $this->parameter_id];
        } elseif ($this->value_id) {
            $where = ['value_id' => $this->value_id];
        }
        if (empty($where)) {
            return;
        }
        $products = ParamsProcessing::find()->select(['product_id'])->where($where)->asArray()->all();
        foreach ($products as $prod) {
            //по продуктам в обработке
            $product = Product::findOne($prod['id']);
            $product->updateParams();
        }
    }
}