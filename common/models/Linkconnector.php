<?php

namespace common\models;

use yii;



class Linkconnector
{
  private $config;
  private $urlAffiliates = 'http://www.linkconnector.com/api/';

  private $urlProducts = 'https://www.linkconnector.com/member/merchantfeeds.htm';

  public function __construct()
  {
    $this->config = isset(Yii::$app->params['linkconnector']) ? Yii::$app->params['linkconnector'] : false;
    if (!$this->config) {
      ddd('Нет настройки для linkconnector');
    }
  }

  public function getAffiliates(){

    $stores=$this->getFunction("getCampaignApproved");
    $links=$this->getFunction("getLinkDeep");
    //$stores=$this->getFunction("getCampaignListDetails");

    $store_g=[];
    foreach ($stores as $store){
      $store_g[$store["CampaignID"]]=$store;
    }

    foreach ($links as $link){
      if (isset($store_g[$link['CampaignID']])) {
        $store_g[$link['CampaignID']]['DeepLinkURL']=$link['DeepLinkURL'].$link['CampaignURL'];
        $cashback="";

        if(strlen($link['FixedMaximumCommission'])>2){
          if($link['FixedMinimumCommission']!=$link['FixedMaximumCommission']){
            $cashback="до ";
          }
          $cashback.=$link['FixedMaximumCommission'];
        }else if(strlen($link['PercentMaximumCommission'])>2){
          if($link['PercentMaximumCommission']!=$link['PercentMaximumCommission']){
            $cashback="до ";
          }
          $cashback.=$link['PercentMaximumCommission'];
        }else{
          $cashback=0;
        }
        $store_g[$link['CampaignID']]['cashback'] = $cashback;
      }
    }

    return array_values($store_g);
  }

  public function getСoupons(){
    return $this->getFunction("getFeedPromotion");
  }

  public function getTransactions($startDate = false)
  {
      return $this->getFunction(
          'getReportTransaction',
          ['StartDate' => $startDate ? date('Y-m-d', $startDate): date('Y-m-d', time() - 3600 * 24 * 30)]
      );
  }

  public function getProductFeedsList()
  {
      return $this->getFunction(
          'getFeedProductSearch',
          ['MerchantIDs'=> '152830']
      );
  }

  private function getFunction($function_name, $params = []){
    $postVars = array(
        "Key"           => $this->config['user_api_key'],
        "Function"      => $function_name,
        "Format"        => "JSON"
    );
    if (!empty($params)) {
        $postVars = array_merge($postVars, $params);
    }
    $ch = curl_init ($this->urlAffiliates);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postVars);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    $data = curl_exec ($ch);
    curl_close($ch);

    $data=(json_decode($data,true));
    $data=$data['Results'];

    return $data;
  }

  private function login()
  {
      $postData = [
          'curdate' => '1544102805',
          'loginkey' => 'ce669c62b540d194d242d0cc7ee0a1e6',
          'dest' => '52411ecd290bc6358045610ec0224105',
          'Tech' => '',
          'Src' => '144884',
          'SourceList' => '',
          'ChkAll' => '',
          'mid' => '',
          'cid' => '',
          'timezone' => '3',
          'Form' => 'loginform',
          'UID' => 'versus',
          'PWD' => '2011odn',
      ];
  }


}