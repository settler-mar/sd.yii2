<?php

namespace common\models;

use yii;

class Ozon
{
  protected $url = 'http://ows.ozon.ru/PartnerStatisticsService/PartnerStatisticsService.asmx';

  /**
   * получение заказов
   * @param bool $dateFrom
   * @return null|\Array
   */
  public function getOrders($dateFrom = false)
  {
    $xml1 = $this->getOrdersFinish($dateFrom);
    $xml2 = $this->getOrdersWait($dateFrom);

    if(!$xml1 && !$xml1) return $xml1;

    if($xml1){
      $data=[
        'DateFrom'=>(string)$xml1->DateFrom,
        'DateTo'=>(string)$xml1->DateTo,
      ];
    }else{
      $data=[
          'DateFrom'=>(string)$xml2->DateFrom,
          'DateTo'=>(string)$xml2->DateTo,
      ];
    };

    $data['OrderItems']=[];
    if($xml1) {
      foreach ($xml1->Stats->OrderItem as $orderItem) {
        $data['OrderItems'][]=(array)$orderItem;
      }
    };
    if($xml2) {
      foreach ($xml2->Stats->OrderItem as $orderItem) {
        $data['OrderItems'][]=(array)$orderItem;
      }
    };

    return $data;
  }

  /**
   * получение завершенных заказов
   * @param bool $dateFrom
   * @return null|\SimpleXMLElement
   */
  public function getOrdersFinish($dateFrom = false)
  {
    $action = 'GetPartnerStatisticInformation';
    $date = $dateFrom ? date('Ymd', $dateFrom) : false;
    $response = $this->makeGetRequest($action, $date);
    $xml = simplexml_load_string($response);
    if ($xml->Error) {
      echo 'Error ' . $xml->Error . ' ' . $xml->ErrorDescription . "\n";
      return null;
    }
    return $xml;
  }

  /**
   * получение заказов в обработке
   * @param bool $dateFrom
   * @return null|\SimpleXMLElement
   */
  public function getOrdersWait($dateFrom = false)
  {
    $action = 'GetPartnerWaitOrder';
    $date = $dateFrom ? date('Ymd', $dateFrom) : false;
    $response = $this->makeGetRequest($action, $date);
    $xml = simplexml_load_string($response);
    if ($xml->Error) {
      echo 'Error ' . $xml->Error . ' ' . $xml->ErrorDescription . "\n";
      return null;
    }
    return $xml;
  }

  /**
   * @param $action
   * @param bool $dateFrom
   * @param bool $dateTo
   * @return mixed
   */
  protected function makeGetRequest($action, $dateFrom = false, $dateTo = false)
  {
    $url = $this->url . '/' . $action . '?' . $this->makeParams($dateFrom, $dateTo);
    //d($url);
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, 0);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    curl_close($ch);

    return $response;
  }

  /**
   * @param $action
   * @param bool $dateFrom
   * @param bool $dateTo
   * @return mixed
   */
  protected function makePostRequest($action, $dateFrom = false, $dateTo = false)
  {
    $url = $this->url . '/' . $action;
    $params = $this->makeParams($dateFrom, $dateTo);

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $params);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    curl_close($ch);

    return $response;
  }

  /**
   * @param bool $dateFrom
   * @param bool $dateTo
   * @return string
   */
  protected function makeParams($dateFrom = false, $dateTo = false)
  {
    $config = Yii::$app->params['outstand_cpa']['ozon'];
    $params = [
        'partnerName' => $config['parthnerId'],
        'login' => $config['login'],
        'password' => $config['password'],
    ];
    if ($dateFrom) {
      $params['dateFrom'] = $dateFrom;
    }
    if ($dateTo) {
      $params['dateTo'] = $dateTo;
    }
    return http_build_query($params);
  }


}