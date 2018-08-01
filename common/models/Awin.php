<?php

namespace common\models;

use yii;

/**
 * https://www.awin.com
логинит здесь - https://ui.awin.com/login
admin@secretdiscounter.com
2011odnNN
 */
class Awin
{
    private $config;
    private $urlAffiliates = 'https://ui2.awin.com/affiliates/shopwindow/datafeed_metadata.php';
    private $urlPublishers = 'https://api.awin.com/publishers';
    private $regions = ['AT','AU','BE','BR','CA','CH','DE','DK','ES','FI','FR','GB','IE','IT','NL','NO','PL','SE','US'];

    public function __construct()
    {
        $this->config = isset(Yii::$app->params['awin']) ? Yii::$app->params['awin'] : false;
        if (!$this->config) {
            ddd('Нет настройки для Awin');
        }
    }


    public function getAffiliates()
    {
        $params = [
            'filter' => 'SUBSCRIBED_ALL', //SUBSCRIBED_ALL|SUBSCRIBED_ENABLED|ALL_ALL|ALL_ENABLED
        ];
        return $this->getRequest($this->urlAffiliates, $params);
    }

    /**
     * некоторая статистика
     * @param bool $dateFrom
     * @param bool $dateTo
     * @return array
     */
    public function getAdvetisers($dateFrom = false, $dateTo = false)
    {
        $dateFrom = $dateFrom ? $dateFrom : ($dateTo ? $dateTo - 3600 * 24 * 365 : time() - 3600 * 24 * 365);
        $params = [
            'endDate' => $dateTo ? date('Y-m-d', $dateTo) :
                date('Y-m-d'),
            'startDate' => date('Y-m-d', $dateFrom),
        ];
        $affiliates = [];
        foreach ($this->regions as $region) {
            $params['region'] = $region;
            $response = $this->getRequestPublisher('reports/advertiser', $params);
            if (count($response)) {
                $affiliates = array_merge($affiliates, $response);
            }
        }
        return $affiliates;
    }

    public function getProgrammes()
    {
        $params= ['relationship' => 'joined'];
        return $this->getRequestPublisher('programmes', $params);
    }

    public function getProgramDetails($params = [])
    {
        return $this->getRequestPublisher('programmedetails', $params);
    }

    public function getCommissions($params = [])
    {
        return $this->getRequestPublisher('commissiongroups', $params);
    }

    public function getPayments($dateFrom = false, $dateTo = false)
    {
        $dateFrom = $dateFrom ? $dateFrom : time() - 60 * 60 * 24 * 30;
        $params = [
            'endDate' => $dateTo ? date('Y-m-d', $dateTo).'T'.date('H:i:s', $dateTo) :
                date('Y-m-d').'T'.date('H:i:s'),
            'startDate' => date('Y-m-d', $dateFrom).'T'.date('H:i:s', $dateFrom),
        ];
        return $this->getRequestPublisher('transactions', $params);
    }

    private function getRequest($url, $params)
    {
        $params['user'] = isset($this->config['user']) ? $this->config['user'] : '';
        $params['password'] = isset($this->config['password']) ? $this->config['password'] : '';
        $params['format'] = 'XML';

        $url .= ('?'. http_build_query($params));

        //The resource that we want to download.
        $file = Yii::getAlias('@runtime'). '/awin.xml';

        //Open file handler.
        $fp = fopen($file, 'w+');

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, 0);
        //curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        //Pass our file handle to cURL.
        curl_setopt($ch, CURLOPT_FILE, $fp);

        //Timeout if the file doesn't download after 20 seconds.
        curl_setopt($ch, CURLOPT_TIMEOUT, 20);

        //Execute the request.
        curl_exec($ch);

        //If there was an error
        if (curl_errno($ch)) {
            d(curl_error($ch). ' '.curl_errno($ch));
        }

        //Get the HTTP status code.
        $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        //Close the cURL handler.
        curl_close($ch);

        if ($statusCode == 200) {
            d('Downloaded!');
            $content = file_get_contents($file);
            $content = preg_replace(['/\<\!\[CDATA\[/', '/\]\]\>/'], '', $content);
            $content = str_replace('&pound;', html_entity_decode('&pound;'), $content);

            $xml = simplexml_load_string($content);

            return $xml;
        } else {
            d("Status Code: " . $statusCode);
        }
    }

    protected function getRequestPublisher($method, $params)
    {
        $url = $this->urlPublishers. '/'. $this->config['user'] .'/'.$method .'/';
        $params['accessToken'] = $this->config['token'];
        $url .= ('?'. http_build_query($params));
        echo $url . "\n";

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, 0);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $content = curl_exec($ch);
        if (curl_errno($ch)) {
            echo curl_error($ch). ' '.curl_errno($ch) . "\n";
        }
        $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($statusCode == 200) {
            $json = json_decode($content, true);
            return $json;
        } else {
            echo "Status Code: " . $statusCode." ". $content. "\n";
        }
    }

}

