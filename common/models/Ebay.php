<?php

namespace common\models;

/*
 *
 * Статьи
 * https://suay.ru/?p=513
 * http://shop-info.su/kak-prodavat-na-ebay/kak-zarabotat-s-pomoshhyu-ebay-nichego-ne-vkladyvaya/
 * https://www.arserblog.com/amazon-vs-ebay-partnerskie-programmy-150/
 *
 * Это их сервис для создания партнерской ссылки
https://epn.ebay.com/tools/link-generator

Sergey Pavlovich SD, [06.09.18 15:02]
купил
на 0.99 долл на ебэе
 *
 */
use yii;

class Ebay
{
    private $url = "https://api.ebay.com/ws/api.dll";
    private $compatabilityLevel = 1061;
    private $siteID = 0;
    private $AppID;
    private $DevID;
    private $CertID;
    private $verb;
    private $ProjectName;
    private $token;
    private $role = 'Buyer';//Buyer  Seller
    private $perPage = 100;
    //private $createTimeTo='2030-12-10T20:34:44.000Z';
    private $createTimeTo='2018-09-10T20:34:44.000Z';


    public function __construct()
    {
        $config = Yii::$app->params['ebay'];
        if ($config) {
            $this->AppID = isset($config['AppID']) ? $config['AppID'] : '';
            $this->DevID = isset($config['DevID']) ? $config['DevID'] : '';
            $this->CertID = isset($config['CertID']) ? $config['CertID'] : '';
            $this->ProjectName = isset($config['ProjectName']) ? $config['ProjectName'] : '';
            $this->token = isset($config['token']) ? $config['token'] : '';
        }
    }


    public function GetOrders($page = 1, $createTimeFrom = false) {
        $createTimeFrom = $createTimeFrom ? $createTimeFrom : date('Y-m-d', strtotime('2018-01-01'));
        $this->verb = 'GetOrders';
        $requestXmlBody ='<?xml version="1.0" encoding="utf-8"?>
						<GetOrdersRequest xmlns="urn:ebay:apis:eBLBaseComponents">
						  <RequesterCredentials>
							<eBayAuthToken>'.$this->token.'</eBayAuthToken>
						  </RequesterCredentials>
						  <CreateTimeFrom>'.$createTimeFrom.'T20:34:44.000Z</CreateTimeFrom>
						  <CreateTimeTo>'.$this->createTimeTo.'</CreateTimeTo>
						  <OrderRole>'.$this->role.'</OrderRole>
						  <OrderStatus>All</OrderStatus>
						  <Pagination>
							<EntriesPerPage>'.$this->perPage.'</EntriesPerPage>
							<PageNumber>'.$page.'</PageNumber>
						  </Pagination>
						</GetOrdersRequest>';
        //ddd($requestXmlBody);
        $responseXml = simplexml_load_string($this->sendHttpRequest($requestXmlBody));

        return $responseXml;
    }



    /**	sendHttpRequest
    Sends a HTTP request to the server for this session
    Input:	$requestBody
    Output:	The HTTP Response as a String
     */
    private function sendHttpRequest($requestBody, $url = false)
    {
        $url = $url ? $url : $this->url;
        //build eBay headers using variables passed via constructor
        $headers = $this->buildEbayHeaders();

        //initialise a CURL session
        $connection = curl_init();
        //set the server we are using (could be Sandbox or Production server)
        curl_setopt($connection, CURLOPT_URL, $url);

        //stop CURL from verifying the peer's certificate
        curl_setopt($connection, CURLOPT_SSL_VERIFYPEER, 0);
        curl_setopt($connection, CURLOPT_SSL_VERIFYHOST, 0);

        //set the headers using the array of headers
        curl_setopt($connection, CURLOPT_HTTPHEADER, $headers);

        //set method as POST
        curl_setopt($connection, CURLOPT_POST, 1);

        //set the XML body of the request
        curl_setopt($connection, CURLOPT_POSTFIELDS, $requestBody);

        //set it to return the transfer as a string from curl_exec
        curl_setopt($connection, CURLOPT_RETURNTRANSFER, 1);

        //Send the Request
        $response = curl_exec($connection);

        //print $response;

        //close the connection
        curl_close($connection);

        //return the response
        return $response;
    }



    /**	buildEbayHeaders
    Generates an array of string to be used as the headers for the HTTP request to eBay
    Output:	String Array of Headers applicable for this call
     */
    private function buildEbayHeaders()
    {
        $headers = [
            //Regulates versioning of the XML interface for the API
            'X-EBAY-API-COMPATIBILITY-LEVEL: ' . $this->compatabilityLevel,

            //set the keys
            'X-EBAY-API-DEV-NAME: ' . $this->DevID,
            'X-EBAY-API-APP-NAME: ' . $this->AppID,
            'X-EBAY-API-CERT-NAME: ' . $this->CertID,

            //the name of the call we are requesting
            'X-EBAY-API-CALL-NAME: ' . $this->verb,

            //SiteID must also be set in the Request's XML
            //SiteID = 0  (US) - UK = 3, Canada = 2, Australia = 15, ....
            //SiteID Indicates the eBay site to associate the call with
            'X-EBAY-API-SITEID: ' . $this->siteID,
        ];

        return $headers;
    }



}