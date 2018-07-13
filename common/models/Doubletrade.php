<?php

namespace common\models;

class Doubletrade
{
    //мануал здесь http://dev.tradedoubler.com/
    //private $reportUrl = 'https://reports.tradedoubler.com/pan/aReport3Key.action?metric1.summaryType=NONE&metric1.lastOperator=/&metric1.columnName2=programId&metric1.operator1=/&metric1.columnName1=programId&metric1.midOperator=/&customKeyMetricCount=0&columns=status&columns=applicationDate&columns=siteName&columns=programId&columns=programName&sortBy=orderDefault&includeWarningColumn=true&affiliateId=3044873&latestDayToExecute=0&setColumns=true&reportTitleTextKey=REPORT3_SERVICE_REPORTS_AAFFILIATEMYPROGRAMSREPORT_TITLE&interval=MONTHS&reportName=aAffiliateMyProgramsReport&key=7b07b59a606f6349e64c100aff74d413';
    private $config;
    private $apiUrl =  'http://api.doubletrade.ru/';


    public function __construct()
    {
        $this->config = isset(\Yii::$app->params['doublertrade']) ? \Yii::$app->params['doublertrade'] : false;
        if (!$this->config) {
            ddd('Config doublertrade not found');
        }
    }


    public function offers()
    {
        return $this->getOffers();
    }

    public function vouchers()
    {
        return  $this->getVouchers();
    }
    public function conversions()
    {
        return  $this->getConversions();
    }
    public function categories()
    {
        return  $this->getCategories();
    }

    private function getOffers()
    {
        $url = $this->apiUrl . 'offers/?' . http_build_query(
            ['web_id' => $this->config['affiliateId'], 'report_key' => $this->config['reportKey']]
        );
        echo $url."\n";
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, 0);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($ch);
        $errno = curl_errno($ch);
        if ($errno !== 0) {
            d(sprintf("Error connecting to tradedoubler: [%s] %s ", $errno, curl_error($ch)), $errno);
        }
        curl_close($ch);

        return json_decode(json_encode(simplexml_load_string($response)), true);
    }

    private function getVouchers($page = 1, $limit = 100)
    {
        $url = 'https://api.tradedoubler.com/1.0/vouchers.json?token=' . $this->config['tokenVouchers'];
        echo $url."\n";
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, 0);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($ch);
        $errno = curl_errno($ch);
        if ($errno !== 0) {
            d(sprintf("Error connecting to tradedoubler: [%s] %s ", $errno, curl_error($ch)), $errno);
        }
        curl_close($ch);

        return json_decode($response, true);
    }

    private function getConversions()
    {
        $url = 'https://api.tradedoubler.com/1.0/conversions/subscriptions?token='.$this->config['tokenConversions'];
        echo $url."\n";
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, 0);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($ch);
        $errno = curl_errno($ch);
        if ($errno !== 0) {
            d(sprintf("Error connecting to tradedoubler: [%s] %s ", $errno, curl_error($ch)), $errno);
        }
        curl_close($ch);

        return json_decode($response, true);
    }

    private function getCategories()
    {
        $url = 'http://api.tradedoubler.com/1.0/productCategoriesjson?token='.$this->config['tokenProducts'];
        echo $url."\n";
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, 0);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($ch);
        $errno = curl_errno($ch);
        if ($errno !== 0) {
            d(sprintf("Error connecting to tradedoubler: [%s] %s ", $errno, curl_error($ch)), $errno);
        }
        curl_close($ch);

        return json_decode($response, true);
    }


}