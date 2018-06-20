<?php

namespace common\models;

use yii;

class Cj
{
    private $devKey;
    private $url = 'https://advertiser-lookup.api.cj.com/v3/advertiser-lookup';


    public function __construct()
    {
        $config = Yii::$app->params['cj.com'];
        $this->devKey = $config && isset($config['dev_key']) ? $config['dev_key'] : '';
    }

    public function getJoined($page, $perPage)
    {
        return $this->getRequest([
            'advertiser-ids'=>'joined',
            'page-number' => $page,
            'records-per-page' => $perPage,
        ]);
    }


    private function getRequest($params)
    {
        $query = http_build_query($params);
        $url = $this->url . ($query ? '?'.$query : '');

        $headers = ["authorization:". $this->devKey];
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $response = curl_exec($ch);
        curl_close($ch);
        $data =  json_decode(json_encode((array)simplexml_load_string($response)), true);
        if (isset($data['error-message'])) {
            echo 'Error: '.$data['error-message']."\n";
            return;
        }
        return $data;
    }

}