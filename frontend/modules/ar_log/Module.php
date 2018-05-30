<?php

//https://github.com/panwenbin/yii2-activerecord-changelog/blob/f4ca4c6522e7e7c5220b5a74b8af511f907d0612/src/behaviors/ActiveRecordChangeLogBehavior.php

namespace frontend\modules\ar_log;

class Module extends \yii\base\Module
{
    public $controllerNamespace = 'frontend\modules\ar_log\controllers';

    public function init()
    {
        parent::init();

        // custom initialization code goes here
    }
}
