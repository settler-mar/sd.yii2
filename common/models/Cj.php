<?php
//Ключ авторизации
//https://developers.cj.com/authentication/overview
namespace common\models;

use yii;
use rdx\graphqlquery\Query as gql;

class Cj
{
  private $devKey;
  private $siteId;
  private $url = 'https://advertiser-lookup.api.cj.com/v2/advertiser-lookup';
  private $commissionUrl = 'https://commission-detail.api.cj.com/v3/commissions';
  private $urlLinkSearch = 'https://link-search.api.cj.com/v2/link-search';


  public function __construct()
  {
    $config = Yii::$app->params['cj.com'];
    $this->devKey = $config && isset($config['dev_key']) ? $config['dev_key'] : '';
    $this->siteId = $config && isset($config['site_id']) ? $config['site_id'] : '';
  }

  public function getJoined($page, $perPage)
  {
    return $this->getRequest($this->url, [
        'advertiser-ids' => 'joined',
        'page-number' => $page,
        'records-per-page' => $perPage,
    ]);
  }

  public function getLinks($page, $perPage, $options = [])
  {
    $data = $this->getRequest($this->urlLinkSearch, array_merge([
        'website-id' => $this->siteId,
        'advertiser-ids' => 'joined',
        'page-number' => $page,
        'records-per-page' => $perPage,
      //'link-type' => 'Text Link'
    ], $options));
    return $data;
  }

  public function getPayments($dateStart = false, $dateEnd = false)
  {
    $dateEnd = $dateEnd ? $dateEnd : time();
    $dateStart = $dateStart ? $dateStart : $dateEnd - 3600 * 24 * 30;

    $data = "{ publisherCommissions(".
      "forPublishers: [\"4701066\"],".
      //"forAdvertisers: [\"4701066\"],".
      "sincePostingDate:\"".date('Y-m-d',$dateStart)."T23:59:59Z\",".
      "beforePostingDate:\"".date('Y-m-d',$dateEnd)."T23:59:59Z\")".
      "{count payloadComplete records {actionTrackerName actionStatus reviewedStatus websiteId advertiserId clickDate postingDate  commissionId websiteName advertiserName postingDate pubCommissionAmountUsd shopperId saleAmountUsd orderId items { quantity perItemSaleAmountPubCurrency totalCommissionPubCurrency }  }  } }";
    //d($data);
    $data = $this->getRequest("https://commissions.api.cj.com/query", $data,true,false);

    return ($data['data']['publisherCommissions']);
  }


  private function GraphQLRequest($name,$params){
    $query = gql::query($name);
    $query->defineFragment('userStuff', 'User');
    //$query->viewer->fields('...userStuff', 'repos');
    //$query->viewer->attribute('public', true);
    //ddd($query->viewer);
    return "{ advertiserCommissions(forPublishers: [\"4701066\"], sincePostingDate:\"2018-08-08T00:00:00Z\",beforePostingDate:\"2018-08-09T00:00:00Z\"){count payloadComplete records {actionTrackerName websiteName advertiserName postingDate pubCommissionAmountUsd items { quantity perItemSaleAmountPubCurrency totalCommissionPubCurrency }  }  } }";
    return $query->build();
  }

  private function getRequest($url, $params,$post = false,$isXml = true)
  {
    if(is_array($params)){
      $query = http_build_query($params);
    }else{
      $query = $params;
    }

    $url = $url . (!$post && $query ? '?' . $query : '');

    d($url,$query);

    $headers = ["Authorization: " . $this->devKey];
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    if($post){
      curl_setopt($ch, CURLOPT_POST, 1);
      curl_setopt($ch, CURLOPT_POSTFIELDS,$query);
    }

    $response = curl_exec($ch);
    curl_close($ch);

    if($isXml){
      $data =  json_encode((array)simplexml_load_string($response));
    }else{
      $data = $response;
    }

    $data = json_decode($data, true);
    if (isset($data['error-message'])) {
      d($params);
      echo 'Error: ' . $data['error-message'] . "\n";
      return;
    }
    return $data;
  }

}