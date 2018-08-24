<?php

namespace common\models;

class Doubletrade
{
    //мануал здесь http://dev.tradedoubler.com/
    //private $reportUrl = 'https://reports.tradedoubler.com/pan/aReport3Key.action?metric1.summaryType=NONE&metric1.lastOperator=/&metric1.columnName2=orderValue&metric1.operator1=/&metric1.columnName1=orderValue&metric1.midOperator=/&customKeyMetricCount=0&columns=orderValue&columns=pendingReason&columns=orderNR&columns=leadNR&columns=link&columns=affiliateCommission&columns=device&columns=vendor&columns=browser&columns=os&columns=deviceType&columns=voucher_code&columns=open_product_feeds_name&columns=open_product_feeds_id&columns=productValue&columns=productNrOf&columns=productName&columns=graphicalElementName&columns=siteName&columns=pendingStatus&columns=eventId&columns=eventName&columns=epi1&columns=lastModified&columns=timeInSession&columns=timeOfEvent&columns=timeOfVisit&includeWarningColumn=true&dateSelectionType=1&filterOnTimeHrsInterval=false&event_id=0&includeMobile=1&breakdownOption=1&sortBy=timeOfEvent&pending_status=1&currencyId=RUB&affiliateId=3044873&latestDayToExecute=0&setColumns=true&reportTitleTextKey=REPORT3_SERVICE_REPORTS_AAFFILIATEEVENTBREAKDOWNREPORT_TITLE&reportName=aAffiliateEventBreakdownReport';
    private $reportUrl = 'https://reports.tradedoubler.com/pan/aReport3Key.action?metric1.summaryType=NONE&metric1.lastOperator=/&metric1.columnName2=orderValue&metric1.operator1=/&metric1.columnName1=orderValue&metric1.midOperator=/&customKeyMetricCount=0&columns=cdt_validation_method_id&columns=pendingRule&columns=validon&columns=rewardPoints&columns=orderValue&columns=pendingReason&columns=orderNR&columns=leadNR&columns=link&columns=affiliateCommission&columns=device&columns=vendor&columns=browser&columns=os&columns=deviceType&columns=voucher_code&columns=open_product_feeds_name&columns=open_product_feeds_id&columns=productValue&columns=productNrOf&columns=productNumber&columns=productName&columns=graphicalElementId&columns=graphicalElementName&columns=siteId&columns=siteName&columns=pendingStatus&columns=eventId&columns=eventName&columns=epi2&columns=epi1&columns=lastModified&columns=timeInSession&columns=timeOfEvent&columns=timeOfVisit&columns=programId&includeWarningColumn=true&dateSelectionType=1&filterOnTimeHrsInterval=false&event_id=0&includeMobile=1&breakdownOption=1&sortBy=timeOfEvent&pending_status=1&affiliateId=3044873&latestDayToExecute=0&setColumns=true&reportTitleTextKey=REPORT3_SERVICE_REPORTS_AAFFILIATEEVENTBREAKDOWNREPORT_TITLE&reportName=aAffiliateEventBreakdownReport';
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

    public function conversions($endDate = false, $startDate = false)
    {
        //return  $this->getConversions();
        $endDate = $endDate ? $endDate : time();
        $startDate = $startDate ? $startDate : $endDate - 3600 * 24 * 60;
        return $this->getReport($endDate, $startDate);
    }

    public function categories()
    {
        return  $this->getCategories();
    }

    private function getReport($endDate, $startDate)
    {
        $url = $this->reportUrl .'&'.http_build_query([
            'key'=> $this->config['reportKey'],
            'format' => 'XML',
            'organizationId' => $this->config['organizationId'],
            'endDate'=> date('d.m.y', $endDate),//'24.08.18',
            'startDate'=> date('d.m.y', $startDate),//'01.07.18',
        ]);
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