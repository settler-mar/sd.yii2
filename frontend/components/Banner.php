<?php

namespace frontend\components;

use yii\base\Widget;
use frontend\modules\banners\models\Banners;


class Banner extends Widget
{
    public $place = '';
    public $options = [];

    public function init()
    {
        parent::init();
    }

    public function run()
    {
        $params = [
            'place' => $this->place,
            'options' => $this->options,
        ];
        return Banners::show($params);
    }
}