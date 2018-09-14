<?php
// http://api.actionpay.ru/
namespace common\models;

use yii;

class Actionpay
{

  private $apiKey;
  private $url = "https://api.actionpay.net/ru-ru";

  public function __construct()
  {
    $config = Yii::$app->params['actionpay'];
    $this->apiKey = $config && isset($config['apiKey']) ? $config['apiKey'] : '';
  }


  public function getMyStores(){
    return $this->getRequest('apiWmMyOffers');
  }

  public function getStores($params=[]){
    return $this->getRequest('apiWmOffers',$params);
  }

  public function getLinks($params=[]){
    return $this->getRequest('apiWmLinks',$params);
  }

  protected function getRequest($method, $params=[])
  {
    $url = $this->url. '/'.$method .'/';
    $params['key'] = $this->apiKey;
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