<?php
namespace frontend\components;

use Yii;
use yii\web\UrlRuleInterface;
use common\models\GeoIpCountry;
use frontend\modules\country\models\CountryToLanguage;
use frontend\modules\constants\models\Constants;

class SdUrlLocalisation implements UrlRuleInterface{
  private $params;
  private $region;
  ///private $url_pref='/';

  public function parseRequest($manager, $request){

    $location = GeoIpCountry::byIp($request->userIP);
    $countryToLanguge = false;
    if ($location) {
        $countryToLanguge = CountryToLanguage::findOne(['country'=>$location['code']]);
    }
    $location['region'] = $countryToLanguge ? $countryToLanguge->region :
        Yii::$app->params['country_to_region_default_region'];
    $location['language'] = $countryToLanguge ? $countryToLanguge->language :
        Yii::$app->params['country_to_region_default_language'];
    Yii::$app->params['location'] = $location;
    //echo json_encode([$request->pathInfo]);

    Yii::info($request->pathInfo);
    Yii::info($request->url);

    $path = explode('/',$request->pathInfo);
    $urlArr = explode('?', $request->url);
    $regionsConfig = Yii::$app->params['regions_list'];
    $regions = [];

    foreach ($regionsConfig as $key => $regionItem) {
        if (isset($regionItem['code'])) {
            $regions[$regionItem['code']] = $regionItem;
            $regions[$regionItem['code']]['key'] = $key;
        } else {
            $keyArray=explode('.', $key);
            $regions[$keyArray[0]] = $regionItem;
            $regions[$keyArray[0]]['key'] = $key;
        }
    }
    //Yii::$app->params['regions_list'] = $regions;

    $region = $path[0];
    if (in_array($region, ['admin', 'admin-categories', 'admin-values', 'admin-stores', 'admin-catalog', 'admin-category'])) {
        $this->region = $regions['default'];
        Yii::$app->params['region'] = 'default';
        Yii::$app->language = 'ru-RU';
    } else {
        if (!in_array($region, array_keys($regions))) {
            //не задан доступный регион
            $url = '/'. (isset($regionsConfig[$location['region']]['code']) ?
                    $regionsConfig[$location['region']]['code'] :
                    $location['region']) . ($request->url == '/' ? '' : $request->url);
            Yii::$app->response->redirect($url, 301)->send();
            exit;
            //return;
        }
        $this->region = $regions[$region];
        $langArr = $this->region['langList'];
        Yii::$app->params['region'] = $this->region['key'];
        unset($path[0]);
        $lang = isset($path[1]) ? $path[1] : false;
        if ($lang && in_array($lang, array_keys($langArr))) {
            unset($path[1]);
            if ($lang == $this->region['langDefault']) {
                //задан язык по умолчанию - редирект
                $url = '/' . implode('/', $path). (isset($urlArr[1]) ? '?'.$urlArr[1] : '');
                Yii::$app->response->redirect($url, 301)->send();
                exit;
            }
            if (in_array($lang, $this->region['langListActive'])) {
                Yii::$app->language = $langArr[$lang];
                Yii::$app->params['lang_code'] = $lang;
            } else {
                Yii::$app->language = isset($langArr[$this->region['langDefault']]) ? $langArr[$this->region['langDefault']] :
                    $this->region['langDefault'];
                Yii::$app->params['lang_code'] = $this->region['langDefault'];
            }
        } else {
            Yii::$app->language = isset($langArr[$this->region['langDefault']]) ? $langArr[$this->region['langDefault']] :
                $this->region['langDefault'];
            Yii::$app->params['lang_code'] = $this->region['langDefault'];
        }

        $request->pathInfo = implode('/', $path);
        $request->url = '/'. $request->pathInfo . (isset($urlArr[1]) ? '?' . $urlArr[1] : '') ;
    }



    //$host=$request->headers['host'];
    //$this->region=isset(Yii::$app->params['regions_list'][$host])?$host:'default';
    //Yii::$app->params['region']=$this->region;
    //$this->region=Yii::$app->params['regions_list'][$this->region];

    //Yii::$app->homeUrl = $host;

    Yii::$app->params['transform_language_list'] = [];
    foreach (Yii::$app->params['regions_list'] as $key => $region) {
        foreach ($region['langList'] as $lang_key => $language) {
            Yii::$app->params['transform_language_list'][$lang_key]['code'] = $language;
            Yii::$app->params['transform_language_list'][$lang_key]['name'] = isset(Yii::$app->params['language_list'][$language]) ?
                Yii::$app->params['language_list'][$language] : $language;
            Yii::$app->params['transform_language_list'][$lang_key]['regions'][$key] = $region;
        }
    }


//    $lg=explode('/',$request->pathInfo)[0];
//    $url=$request->url;
//    $pathInfo=$request->pathInfo;
//    if(isset($this->region['langList'][$lg])){
//      //$url=str_replace($lg,'',$url);
//      $url=preg_replace("/^\/$lg/", '', $url);
//      $url='/'.trim($url,'/');
//      if($lg==$this->region['langDefault']){
//        Yii::$app->response->redirect($url, 301)->send();
//        exit();
//      }
//      //$this->url_pref='/'.$lg.'/';
//      $request->baseUrl='/'.$lg;
//      //ddd($request);
//      $request->url=$url;
//      $request->pathInfo=explode('?',trim($url,'/'))[0];
//    }else{
//      $lg=$this->region['langDefault'];
//    }
//
//    $lg_code=$this->region['langList'][$lg];
//    Yii::$app->language=$lg_code;
//    Yii::$app->params['lang_code']=$lg;

    if (Yii::$app->language != 'ru-RU') {
        Yii::$app->mailer->setViewPath(Yii::$app->mailer->getViewPath(). '/' . Yii::$app->language);
    }

    if(isset($this->region['params'])){
      foreach ($this->region['params'] as $k=>$v){
        Yii::$app->params['regions'][$k]=$v;
      }
    }
    if(isset($this->region['app'])){
      foreach ($this->region['app'] as $k=>$v){
        Yii::$app->$k=$v;
      }
    }

    if(isset($this->region[$lang])){
      if(isset($this->region[$lang]['params'])){
        foreach ($this->region[$lang]['params'] as $k=>$v){
          Yii::$app->params['regions'][$k]=$v;
        }
      }
      if(isset($this->region[$lang]['app'])){
        foreach ($this->region[$lang]['app'] as $k=>$v){
          Yii::$app->$k=$v;
        }
      }
    }
    return false;
  }

  public function createUrl($route, $params=array(), $ampersand='&')
  {
    return false;
  }
}