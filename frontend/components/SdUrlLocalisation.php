<?php
namespace frontend\components;

use Yii;
use yii\web\UrlRuleInterface;

class SdUrlLocalisation implements UrlRuleInterface{
  private $params;
  private $region;
  ///private $url_pref='/';

  function __construct() {
    $this->params=require(__DIR__ . '/../config/regions.config-local.php');
  }

  public function parseRequest($manager, $request){
    $host=$request->headers['host'];
    $this->region=isset($this->params[$host])?$this->params[$host]:$this->params['default'];
    Yii::$app->homeUrl=$host;

    $lg=explode('/',$request->pathInfo)[0];
    $url=$request->url;
    $pathInfo=$request->pathInfo;
    if(isset($this->region['langList'][$lg])){
      //$url=str_replace($lg,'',$url);
      $url=preg_replace("/^\/$lg/", '', $url);
      $url='/'.trim($url,'/');
      if($lg==$this->region['langDefault']){
        Yii::$app->response->redirect($url, 301)->send();
        exit();
      }
      //$this->url_pref='/'.$lg.'/';
      $request->baseUrl='/'.$lg;
      //ddd($request);
      $request->url=$url;
      $request->pathInfo=explode('?',trim($url,'/'))[0];
    }else{
      $lg=$this->region['langDefault'];
    }

    $lg_code=$this->region['langList'][$lg];
    Yii::$app->language=$lg_code;

    if(isset($this->region['params'])){
      foreach ($this->region['params'] as $k=>$v){
        Yii::$app->params[$k]=$v;
      }
    }
    if(isset($this->region['app'])){
      foreach ($this->region['app'] as $k=>$v){
        Yii::$app->$k=$v;
      }
    }

    if(isset($this->region[$lg])){
      if(isset($this->region[$lg]['params'])){
        foreach ($this->region[$lg]['params'] as $k=>$v){
          Yii::$app->params[$k]=$v;
        }
      }
      if(isset($this->region[$lg]['app'])){
        foreach ($this->region[$lg]['app'] as $k=>$v){
          Yii::$app->$k=$v;
        }
      }
    }

    return false;
  }

  public function createUrl($route, $params=array(), $ampersand='&')
  {
    return false;
    if(is_string($params)){
      $url=$this->url_pref.$params;
    }else{
      d($this->url_pref);
      d($route);
      ddd($params);
    }
    ddd(1);
    $url=str_replace('//','/',$url);
    return $url;
    if (empty($params['language'])) {
      d($params);
      //$params['language']='';//isset(Yii::$app->language)?Yii::$app->language:'';
    }
    return parent::createUrl($route, $params, $ampersand);
  }
}