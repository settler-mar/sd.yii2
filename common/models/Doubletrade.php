<?php

namespace common\models;

class Doubletrade
{
    private $reportUrl = 'https://reports.tradedoubler.com/pan/aReport3Key.action?metric1.summaryType=NONE&metric1.lastOperator=/&metric1.columnName2=programId&metric1.operator1=/&metric1.columnName1=programId&metric1.midOperator=/&customKeyMetricCount=0&columns=status&columns=applicationDate&columns=siteName&columns=programId&columns=programName&sortBy=orderDefault&includeWarningColumn=true&affiliateId=3044873&latestDayToExecute=0&setColumns=true&reportTitleTextKey=REPORT3_SERVICE_REPORTS_AAFFILIATEMYPROGRAMSREPORT_TITLE&interval=MONTHS&reportName=aAffiliateMyProgramsReport&key=7b07b59a606f6349e64c100aff74d413';
    private $affiliateId = 3044873;
    private $reportKey = '7b07b59a606f6349e64c100aff74d413';
    private $url = 'http://api.doubletrade.ru/';
    private $tokenProducts = 'F37CF4D9328741C32097539AA4E02D346BE0BEB6';
    private $tokenVouchers = '761C55597D6FFEA524A4AAFFE7E6D93A4F3DBD55';
    private $tokenPublisherVouchers = '7EB9463BF01D9535478B61CE81404D1CFFE2C0F8';
    private $tokenConversions = '4972CD3B8619F74F419B703CF878E10681C1BB0A';


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

    private function getOffers()
    {
        $url = $this->url. 'offers/?' . http_build_query(
            ['web_id' => $this->affiliateId, 'report_key' => $this->reportKey]
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

    private function getVouchers()
    {
        $url = 'https://api.tradedoubler.com/1.0/vouchers.json?token=' . $this->tokenVouchers;
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
        $url = 'https://api.tradedoubler.com/1.0/conversions/subscriptions?token='.$this->tokenConversions;
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