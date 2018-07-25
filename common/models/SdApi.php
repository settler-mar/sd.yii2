<?php

namespace common\models;

/**
 * пример доступа к собственному апи
 * Class SdApi
 * @package common\models
 */
class SdApi
{
    protected $token;
    protected $url = 'http://sdapi/';//надо поменять на реальный 'http://api.secretdiscounter.ru/'
    protected $client_id = 'testclient';//client_id пользователя
    protected $client_secret = 'testpass';//client_secret пользователя
    protected $grant_type = 'password';

    public function __construct()
    {
        //получение токен
        $url = $this->url . 'oauth2/default/token';
        $params = [
            'grant_type'=> $this->grant_type,
            'client_id'=> $this->client_id,
            'client_secret'=> $this->client_secret,
        ];
        $params = http_build_query($params);

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $params);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($ch);
        $errno = curl_errno($ch);
        if ($errno !== 0) {
            echo  sprintf("Error connecting to Api : [%s] %s ", $errno, curl_error($ch)). " " .
                $errno . "\n";
            exit;
        }
        curl_close($ch);
        $token = json_decode($response, true);
        if (isset($token['access_token'])) {
            $this->token = $token;
        } else {
            echo $response;
            exit;
        }
    }

    /**
     * получение шопов
     * @param bool $page
     * @param bool $onPage
     * @return mixed
     */
    public function getStores($page = false, $onPage = false)
    {
        return $this->getRequest('stores', [
            'page' => $page,
            'on-page' => $onPage,
        ]);
    }

    /**
     * получение платежей
     * @param bool $page
     * @param bool $onPage
     * @param bool $dateFrom
     * @return mixed
     */
    public function getPayments($page = false, $onPage = false, $dateFrom = false)
    {
        return $this->getRequest('payments', [
            'page' => $page,
            'on-page' => $onPage,
            'date-from' => $dateFrom,
        ]);
    }

    /**
     * запрос
     * @param $method
     * @param $params
     * @return mixed
     */
    protected function getRequest($method, $params)
    {
        $url = $this->url . $method;
        $requestParams = [
            'access-token'=> $this->token['access_token'],
        ];
        if (!empty($params['page'])) {
            $requestParams['page'] = $params['page'];
        }
        if (!empty($params['on-page'])) {
            $requestParams['on-page'] = $params['on-page'];
        }
        if (!empty($params['date-from'])) {
            $requestParams['date-from'] = $params['date-from'];
        }

        $requestParams = http_build_query($requestParams);
        $url .= '?' . $requestParams;
        echo $url . "\n";
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, 0);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($ch);
        $errno = curl_errno($ch);
        if ($errno !== 0) {
            echo sprintf("Error getting data: [%s] %s ", $errno, curl_error($ch)), " " .
                $errno . "\n";
        }
        curl_close($ch);
        return json_decode($response, true);
    }
}