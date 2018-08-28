<?php

namespace common\models;

use yii;

class Rakute {
  public $domain = "https://api.rakutenmarketing.com/%s/%s";

  private $merchUrl = "http://cli.linksynergy.com/cli/publisher/programs/adv_info.php";


  /**
   * Curl handle
   *
   * @var resource
   */
  protected $curl;
  /**
   * API Key for authenticating requests
   *
   * @var string
   */
  protected $api_key;

  private $config;
  /**
   * The Commission Junction API Client is completely self contained with it's own API key.
   * The cURL resource used for the actual querying can be overidden in the contstructor for
   * testing or performance tweaks, or via the setCurl() method.
   *
   * @param string $api_key API Key
   * @param null|resource $curl Manually provided cURL handle
   */
  public function __construct($curl = null) {
    $cache = Yii::$app->cache;

    $this->config = Yii::$app->params['rakute'];

    $bearer_token=$cache->getOrSet('bearer_token', function () {
      $this->api_key="Basic ".$this->config['basic_token'];
      return $this->getToken()->access_token;
    }, 3600);

    $this->api_key = "Bearer ".$bearer_token ;

    if ($curl) $this->setCurl($curl);
  }

  public function merchantDetail($merchantId)
  {
      $oid = isset($this->config['oid']) ? $this->config['oid'] : '';
      $url = $this->merchUrl. "?mid=" . $merchantId . '&oid=' . $oid;
      //return file_get_contents($url);
      return $this->cli($url);
  }

  /**
   * Convenience method to access Product Catalog Search Service
   *
   * @param array $parameters GET request parameters to be appended to the url
   * @return array Commission Junction API response, converted to a PHP array
   * @throws Exception on cURL failure or http status code greater than or equal to 400
   */
  public function productSearch(array $parameters = array()) {
    return $this->api("productsearch", false, $parameters);
  }

  public function merchantList(array $parameters = array()) {
    return $this->api("advertisersearch", false, $parameters);
  }

  /*покупки*/
  public function events(array $parameters = array()) {
    return $this->api("events","transactions", $parameters);
  }

  public function getMerchByID($mid){
    return $this->api("linklocator","getMerchByID/".$mid);
  }

  public function getTextLinksByID($mid){
    return $this->api("linklocator","getTextLinks/".$mid);
  }

  public function getBannerLinksByID($mid){
    return $this->api("linklocator","getBannerLinks/".$mid);
  }

  public function getDrmLinksByID($mid){
    return $this->api("linklocator","getDRMLinks/".$mid);
  }

  public function getCoupons($parameters = []){
    return $this->api("coupon", false, $parameters);
  }

  public function test(array $parameters = array()) {
    return $this->api("events","transactions", $parameters);
  }

  public function getToken()
  {
    return $this->apiToken("token", "token", $parameters = array());
  }

  private function cli($url) {
        $ch = $this->getCurl();
        echo $url."\n";
        echo $this->api_key."\n";

      curl_setopt_array($ch, array(
            CURLOPT_URL  => $url,
            CURLOPT_HTTPHEADER => array(
                //'Accept: application/xml',
                'authorization: ' . $this->api_key,

            )
        ));
        $body = curl_exec($ch);
        $errno = curl_errno($ch);
        if ($errno !== 0) {
            d(sprintf("Error connecting to CommissionJunction: [%s] %s ", $errno, curl_error($ch)), $errno);
        }

        $http_status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        if ($http_status >= 400) {
            d(sprintf("CommissionJunction Error [%s] %s", $http_status, strip_tags($body)), $http_status);
        }
        //d($body);
        $body=str_replace("ns1:","",$body);
        curl_close($ch);
        return $body;
    }

  /**
   * Convenience method to access Commission Detail Service
   *
   * @param array $parameters GET request parameters to be appended to the url
   * @return array Commission Junction API response, converted to a PHP array
   * @throws Exception on cURL failure or http status code greater than or equal to 400
   */
  private function commissionDetailLookup(array $parameters = array()) {
    throw new Exception("Not implemented");
  }
  /**
   * Generic method to fire API requests at Commission Junctions servers
   *
   * @param string $subdomain The subomdain portion of the REST API url
   * @param string $resource The resource portion of the REST API url (e.g. /v2/RESOURCE)
   * @param array $parameters GET request parameters to be appended to the url
   * @param string $version The version portion of the REST API url, defaults to v2
   * @return array Commission Junction API response, converted to a PHP array
   * @throws Exception on cURL failure or http status code greater than or equal to 400
   */
  public function api($subdomain, $resource, array $parameters = array(), $version = '1.0') {
    $ch = $this->getCurl();
    $url = sprintf($this->domain, $subdomain, $version);

    if($resource && strlen($resource)>3 && $resource!=$subdomain){
      $url.='/'.$resource;
    }

    if (!empty($parameters))
      $url .= "?" . http_build_query($parameters);

    echo $url."\n";
    curl_setopt_array($ch, array(
        CURLOPT_URL  => $url,
        CURLOPT_HTTPHEADER => array(
            'Accept: application/xml',
            'authorization: ' . $this->api_key,
        )
    ));
    $body = curl_exec($ch);
    $errno = curl_errno($ch);
    if ($errno !== 0) {
      d(sprintf("Error connecting to CommissionJunction: [%s] %s ", $errno, curl_error($ch)), $errno);
    }

    $http_status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    if ($http_status >= 400) {
      d(sprintf("CommissionJunction Error [%s] %s", $http_status, strip_tags($body)), $http_status);
    }
    //d($body);
    $body=str_replace("ns1:","",$body);
    return json_decode(json_encode((array)simplexml_load_string($body)), true);
  }

  public function apiToken($subdomain, $resource, array $parameters = array(), $version = '1.0') {
    $data = array(
        "grant_type" => "password",
        "username" => $this->config['username'],
        'password'=>$this->config['password'],
        'scope'=>$this->config['scope'],
    );
    $data_string = http_build_query($data);

    $ch = curl_init('https://api.rakutenmarketing.com/token');
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data_string);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'Accept: */*',
        'Content-Type: application/x-www-form-urlencoded',
        'Authorization: '.$this->api_key,
    ));
    $body = curl_exec($ch);
    $errno = curl_errno($ch);
    if ($errno !== 0) {
      ddd(sprintf("Error connecting to CommissionJunction Token : [%s] %s", $errno, curl_error($ch)), $errno);
    }

    $http_status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    if ($http_status >= 400) {
      d(sprintf("CommissionJunction Error Token  [%s] %s", $http_status, strip_tags($body)), $http_status);
    }
    return json_decode($body);
  }
  /**
   * @param resource $curl
   */
  public function setCurl($curl) {
    $this->curl = $curl;
  }
  /**
   * @return resource
   */
  public function getCurl() {
    if (!is_resource($this->curl)) {
      $this->curl = curl_init();
      curl_setopt_array($this->curl, array(
          CURLOPT_SSL_VERIFYPEER => false,
          CURLOPT_SSL_VERIFYHOST => 2,
          CURLOPT_FOLLOWLOCATION => false,
          CURLOPT_MAXREDIRS      => 1,
          CURLOPT_RETURNTRANSFER => true,
          CURLOPT_CONNECTTIMEOUT => 10,
          CURLOPT_TIMEOUT        => 30,
      ));
    }
    return $this->curl;
  }
}