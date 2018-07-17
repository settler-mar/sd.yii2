<?php

namespace common\models;

use yii;

class Performancehorizon
{
  public $domain = "https://api.performancehorizon.com/);";

  /**
   * API Key for authenticating requests
   *
   * @var string
   */
  protected $api_key;

  private $config;

  public function __construct($curl = null) {
    $cache = Yii::$app->cache;

    $this->config = Yii::$app->params['performancehorizon'];

    $this->api_key = ($this->config['token'].":".$this->config['user_api_key']); ;

  }

  public function getStores()
  {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "https://api.performancehorizon.com/campaign");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
    curl_setopt($ch, CURLOPT_HEADER, FALSE);

    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'Accept: */*',
        'Content-Type: application/json; charset=utf-8',
        'Authorization: Basic '.base64_encode($this->api_key),
    ));

    $response = curl_exec($ch);
    curl_close($ch);


    $response=json_decode($response,true);

    return $response;
  }

    public function test(){
    $ch = curl_init();
    /*curl_setopt_array($ch, array(
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => 2,
        CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_MAXREDIRS      => 1,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT        => 30,
    ));*/

    //$campaign_id="1100l435";
    $campaign_id="1011l49";
    $title="iHerb";
    $advertiser_id = "1100l216";

    //curl_setopt($ch, CURLOPT_URL, "https://api.performancehorizon.com/campaign"); //шопы
    //curl_setopt($ch, CURLOPT_URL, "https://api.performancehorizon.com/user"); //данные юзера
    //curl_setopt($ch, CURLOPT_URL, "https://api.performancehorizon.com/user/publisher");
    //curl_setopt($ch, CURLOPT_URL, "https://api.performancehorizon.com/network");
    curl_setopt($ch, CURLOPT_URL, "https://api.performancehorizon.com/network/1011l49/publisher");
    //curl_setopt($ch, CURLOPT_URL, "https://api.performancehorizon.com/campaign/".$campaign_id.""); //Данные шопа по ид

    //https://api.performancehorizon.com/campaign/campaign_id/commission
    //curl_setopt($ch, CURLOPT_URL, "https://api.performancehorizon.com/campaign/".$campaign_id."/commission");
    //https://api.performancehorizon.com/campaign/campaign_id/voucher_code
    //curl_setopt($ch, CURLOPT_URL, "https://api.performancehorizon.com/campaign/".$campaign_id."/voucher_code");


    //curl_setopt($ch, CURLOPT_URL, "https://api.performancehorizon.com/campaign/1100l216/commission_group");
    //curl_setopt($ch, CURLOPT_URL, "https://api.performancehorizon.comcampaign/".$campaign_id."/tracking");
    //https://api.performancehorizon.com/campaign/10l176/voucher_code
    //curl_setopt($ch, CURLOPT_URL, "https://api.performancehorizon.com/campaign/".$campaign_id."/voucher_code");
    //curl_setopt($ch, CURLOPT_URL, "https://api.performancehorizon.com/user/advertiser?limit=100&offset=0");
    //curl_setopt($ch, CURLOPT_URL, "https://api.performancehorizon.com/user/publisher/1100l31778/campaign/a/tracking");
    //curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
    //curl_setopt($ch, CURLOPT_HEADER, FALSE);

    //curl_setopt($ch, CURLOPT_URL, "https://".$this->api_key."@api.performancehorizon.com/campaign/1100l435/tracking");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
    curl_setopt($ch, CURLOPT_HEADER, FALSE);

    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'Accept: */*',
        'Content-Type: application/json; charset=utf-8',
        'Authorization: Basic '.base64_encode($this->api_key),
    ));

    $response = curl_exec($ch);
    curl_close($ch);


    $response=json_decode($response,true);
/*
    unset($response["campaigns"][0]['campaign']['description']);
    unset($response["campaigns"][0]['campaign']['terms']);
    d($response["campaigns"][0]['campaign']);

    unset($response["campaigns"]);/**/
    d($response);
    //d($response["publishers"][0]);
  }

}