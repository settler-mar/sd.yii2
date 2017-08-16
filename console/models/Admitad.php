<?php

namespace console\models;

use \Admitad\Api\Api;
use Yii;

class Admitad{

  private $config;
  private $admitad;
  private $authorizeData;

  public function init($scope){
    $this->config=Yii::$app->params['admitad'];

    $api = new Api();
    $this->authorizeData = $api->authorizeClient(
      $this->config['clientId'],
      $this->config['clientSecret'],
      $scope
    )->getArrayResult();

    $this->admitad = new Api($this->authorizeData ['access_token']);
  }

  public function test(){
    $this->init('public_data');
    return $this->authorizeData ;
  }

  public function getCupons($options=array()){
    $this->init('coupons_for_website');

    $websiteId=$this->config['websiteId'];
    $data=$this->admitad->get("/coupons/website/$websiteId/", $options)->getResult();
    return $data;
  }

  public function getRegion($options=array()){ // не работает
    $this->init('public_data');
    $data=$this->admitad->get("/regions/", $options)->getArrayResult();
    return $data;
  }

  public function getPayments($options=array()){ // не работает
    $this->init('statistics');
    $data=$this->admitad->get("/statistics/actions/", $options)->getArrayResult();
    return $data;
  }
}