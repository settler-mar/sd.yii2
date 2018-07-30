<?php

namespace common\models;

use yii;



class Linkconnector
{
  private $config;
  private $urlAffiliates = 'http://www.linkconnector.com/api/';

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

    $stores=[];
    foreach ($links as $link){
      if(isset($store_g[$link['CampaignID']])){
        $data=$store_g[$link['CampaignID']];
        $data['DeepLinkURL']=$link['DeepLinkURL'].$link['CampaignURL'];

        $data['cashback']="";
        if(strlen($link['FixedMaximumCommission'])>2){
          if($link['FixedMinimumCommission']!=$link['FixedMaximumCommission']){
            $data['cashback']="до ";
          }
          $data['cashback'].=$link['FixedMaximumCommission'];
        }else if(strlen($link['PercentMaximumCommission'])>2){
          if($link['PercentMaximumCommission']!=$link['PercentMaximumCommission']){
            $data['cashback']="до ";
          }
          $data['cashback'].=$link['PercentMaximumCommission'];
        }else{
          $data['cashback']=0;
        }
        $stores[]=$data;
      }
    }

    return ($stores);
  }

  public function getСoupons(){
    ddd($this->getFunction("getFeedProductInventoryStock"));
  }

  private function getFunction($function_name){
    $postVars = array(
        "Key"           => $this->config['user_api_key'],
        "Function"      => $function_name,
        "Format"        => "JSON"
    );

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
}