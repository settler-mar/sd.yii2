<?php
namespace shop\components;

use Yii;
use yii\web\UrlRuleInterface;
use common\models\GeoIpCountry;
use frontend\modules\country\models\CountryToLanguage;


class SdUrlLocalisation implements UrlRuleInterface{

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

    $path = explode('/',$request->pathInfo);
    $url = $request->url;
    Yii::$app->params['region'] = 'default';
    foreach(Yii::$app->params['regions_list'] as $key => $region) {
        if (!empty($region['code']) && $path[0] == $region['code']) {
            $url = substr($url, strlen('/'.$path[0]));
            if ($key == 'default') {
                //регион  совпадает с default - делать редирект
                Yii::$app->response->redirect($url)->send();
            }
            Yii::$app->params['region'] = $key;
            array_splice($path, 0, 1);
            break;
        }
    }
    $baseLangCode = substr(Yii::$app->params['base_lang'], 0, 2);
    Yii::$app->language = Yii::$app->params['base_lang'];
    Yii::$app->params['lang_code'] = $baseLangCode;
    foreach(Yii::$app->params['language_list'] as $key => $language) {
        $keyCode = substr($key, 0, 2);
        if ($path[0] == $keyCode) {
            $url = substr($url, strlen('/'.$path[0]));
            if ($keyCode == $baseLangCode) {
                //язык  совпадает с default - делать редирект
                Yii::$app->response->redirect($url)->send();
            }
            Yii::$app->language = $key;
            Yii::$app->params['lang_code'] = $keyCode;
            array_splice($path, 0, 1);
            break;
        }
    }
    $request->url = $url;
    $request->pathInfo = implode('/', $path);

    Yii::$app->params['transform_language_list'] = [];
    foreach (Yii::$app->params['regions_list'] as $key => $region) {
        foreach ($region['langList'] as $lang_key => $language) {
            Yii::$app->params['transform_language_list'][$lang_key]['code'] = $language;
            Yii::$app->params['transform_language_list'][$lang_key]['name'] = isset(Yii::$app->params['language_list'][$language]) ?
                Yii::$app->params['language_list'][$language] : $language;
            Yii::$app->params['transform_language_list'][$lang_key]['regions'][$key] = $region;
        }
    }
    return false;
  }

  public function createUrl($route, $params=array(), $ampersand='&')
  {
    return false;
  }
}