<?php

namespace common\models;

use yii;

class Cj
{
    private $devKey;
    private $url = 'https://advertiser-lookup.api.cj.com/v3/advertiser-lookup';
    private $commissionUrl = 'https://commission-detail.api.cj.com/v3/commissions';


    public function __construct()
    {
        $config = Yii::$app->params['cj.com'];
        $this->devKey = $config && isset($config['dev_key']) ? $config['dev_key'] : '';
    }

    public function getJoined($page, $perPage)
    {
        return $this->getRequest($this->url, [
            'advertiser-ids'=>'joined',
            'page-number' => $page,
            'records-per-page' => $perPage,
        ]);
    }

    public function getPayments($dateStart = false, $dateEnd = false)
    {
        $dateEnd = $dateEnd ? $dateEnd : time();
        $dateStart = $dateStart ? $dateStart : $dateEnd - 3600 * 24 * 30;
        return $this->getRequest($this->commissionUrl, [
            'date-type'=>'event', //'posting'
            //'end-date' => date('Y-m-d H:i:s', $dateEnd),
            //'start-date' => date('Y-m-d H:i:s', $dateStart),
           // 'action-types' => 'sale',

        ]);
    }


    private function getRequest($url, $params)
    {
        $query = http_build_query($params);
        $url = $url . ($query ? '?'.$query : '');

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