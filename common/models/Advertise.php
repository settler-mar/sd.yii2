<?php

namespace common\models;

use yii;

class Advertise
{
    private $config;
    private $url = 'https://advertise.ru/export/';

    public function __construct()
    {
        if (isset(Yii::$app->params['advertise'])) {
            $this->config = Yii::$app->params['advertise'];
        } else {
            ddd('Config Advertise not found!');
        }
    }


    public function offers()
    {
        return $this->getRequest('offers', ['connected_offers' => 1]);
    }

    protected function getRequest($method, $params = [])
    {
        $params = array_merge($params, [
            'user_id' => $this->config['user_id'],
            'token' => $this->config['token'],
            'format' => 'json'
        ]);
        $url = $this->url.$method.'/&'. http_build_query($params);
        echo $url."\n";
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, 0);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($ch);
        $errno = curl_errno($ch);
        if ($errno !== 0) {
            d(sprintf("Error connecting to Advertise API: [%s] %s ", $errno, curl_error($ch)), $errno);
        }
        curl_close($ch);

        return json_decode($response, true);


    }
}