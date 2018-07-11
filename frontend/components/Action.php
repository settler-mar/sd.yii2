<?php

namespace frontend\components;

use yii\base\Widget;
use yii;
use frontend\modules\actions\models\Actions;


class Action extends Widget
{
    public $id = '';
    public $options = [
        'only_enabled'=> false,
    ];

    public function init()
    {
        parent::init();
    }

    public function run()
    {
        if (Yii::$app->user->isGuest || empty($this->id)) {
            return '';
        }
        $actions = Actions::byUser(Yii::$app->user->id);
        //или доступная или подключённая акция
        $action = !empty($actions['enabled'][$this->id]) ? $actions['enabled'][$this->id] :
            (!empty($actions['joined'][$this->id]) ? $actions['joined'][$this->id] : false);
        return $this->render('@app/views/widgets/action', ['action'=>$action]);
    }
}