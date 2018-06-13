<?php

namespace common\models;

use yii;

class Ebay
{
    private $url = "https://api.ebay.com/ws/api.dll";
    private $AppID;
    private $DevID;
    private $CertID;


    public function __construct()
    {
        $config = Yii::$app->params['ebay'];
        if ($config) {
            $this->AppID = isset($config['AppID']) ? $config['AppID'] : '';
            $this->DevID = isset($config['DevID']) ? $config['DevID'] : '';
            $this->CertID = isset($config['CertID']) ? $config['CertID'] : '';
        }
    }

}