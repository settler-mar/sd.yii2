<?php

namespace console\components;

use yii\base\Object;
use yii;

/**
 *  создание кеш для товаров
 * Class ProductCacheMake
 * @package console\components
 */
class ProductCacheMake extends Object implements \yii\queue\Job
{
    public function execute($queue)
    {
        Yii::$app->runAction('product-cache/index');
    }
}