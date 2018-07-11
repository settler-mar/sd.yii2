<?php

namespace common\models;

class Travelpayouts
{
    private $apiToken = 'a8c77227884722401b63a30287a02ba9';
    private $parthnerMarker = '134553';
    private $url = 'http://api.travelpayouts.com/v2/';
    private $affiliateLink = 'http://c1.travelpayouts.com/click?shmarker=134553.<userid>&promo_id=<promoid>&source_type=link&type=click';
    private $statistic = 'http://api.travelpayouts.com/v2/statistics/detailed-sales?group_by=date_marker&month=2015-05-14&host_filter=null&marker_filter=null&token=APItoken';//??
    private $compaingsUrl = 'https://www.travelpayouts.com/campaigns';


    public function getPeyments()
    {
        //return $this->getRequest('statistics/payments');
        return $this->getRequest('/statistics/detailed-sales?group_by=date_marker&month=' .
            date('Y-m-d', time()-60*60*24*30));
    }

    public function getCompaings()
    {

        $response = file_get_contents($this->compaingsUrl);

        return $response;
    }


    private function getRequest($method)
    {
        $url = $this->url.'/'.$method;
        d($url);
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HEADER, false);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ["X-Access-Token: " . $this->apiToken]);
        $response = curl_exec($ch);
        $errno = curl_errno($ch);
        if ($errno !== 0) {
            d(sprintf("Error connecting to Travelpayouts: [%s] %s ", $errno, curl_error($ch)), $errno);
        }
        curl_close($ch);

        return $response;
    }

}