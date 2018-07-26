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

}

