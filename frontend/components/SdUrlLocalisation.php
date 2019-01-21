<?php
namespace frontend\components;

use Yii;
use yii\web\NotFoundHttpException;
use yii\web\UrlRuleInterface;
use common\models\GeoIpCountry;
use frontend\modules\country\models\CountryToLanguage;
use frontend\modules\constants\models\Constants;

class SdUrlLocalisation implements UrlRuleInterface{
  private $params;
  private $region;

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
    $urlArr = explode('?', $request->url);
    $regions = Yii::$app->params['regions_list'];

    $prefixes = [];//все возможные префиксы
    $langReverse = [];//все возможные языки перевёрнуто
    $langs=[]; //не перевёрнуто
    foreach ($regions as $key => $regionItem) {
        foreach ($regionItem['langList'] as $langKey => $langActive) {
            $langReverse[$langActive] = $langKey;
            $langs[$langKey] = $langActive;
            if (in_array($key, $regionItem['langListActive'])) {
                $prefixes[$key . '-' . $langKey] = [
                    'region' => $key,
                    'language' => $regionItem['langList'][$langKey],
                    'redirect' => $regionItem['langDefault'] == $langKey ? $key : false,
                ];
                if ($regionItem['langDefault'] == $langKey) {
                    $prefixes[$key] = [
                        'region' => $key,
                        'language' => $regionItem['langList'][$langKey],
                        'redirect' => false,
                    ];
                }
            }
        }
        //языки, отсутсвующие в регионе
        $emptyLanguages = array_diff(array_keys($langs), array_keys($regionItem['langList']));
        //по ним редирект
        foreach ($emptyLanguages as $emptyLanguage) {
            $prefixes[$key . '-' . $emptyLanguage] = [
                'region' => $key,
                'language' => $langs[$regionItem['langDefault']],
                'redirect' => $key,
            ];
        }
    }
    $defaultPrefix = $location['region'] . (isset($langReverse[$location['language']]) ?
            '-' . $langReverse[$location['language']] : '');
    if (isset($prefixes[$defaultPrefix])) {
        $defaultPrefix = $prefixes[$defaultPrefix]['redirect'] ? $prefixes[$defaultPrefix]['redirect'] : $defaultPrefix;
    } else {
        $defaultPrefix = 'ru';
    }

    $prefix = $path[0];
    if (in_array($prefix, ['admin', 'admin-categories', 'admin-values', 'admin-stores', 'admin-catalog', 'admin-category'])) {
        $this->region = $regions['ru'];
        Yii::$app->params['region'] = 'ru';
        Yii::$app->language = 'ru-RU';
        $lang = 'ru';
        Yii::$app->params['url_prefix'] = 'ru';
        Yii::$app->params['lang_code'] = 'ru';
    } else {
        if (!in_array($prefix, array_keys($prefixes))) {
            //такой префикс недопустим
            //редирект на тот что из гео ип
            $newUrl = '/' . $defaultPrefix . ($request->url == '/' ? '' : $request->url);
            Yii::$app->response->redirect($newUrl)->send();
            exit;
        }
        if ($prefixes[$prefix]['redirect']) {
            //для префикс редирект задан
            $newUrl = implode('/', array_slice($path, 1));
            $newUrl = ($newUrl ? '/' . $newUrl : '') . (isset($urlArr[1]) ? '?' . $urlArr[1] : '');
            $newUrl = '/'.$prefixes[$prefix]['redirect'] . $newUrl;
            Yii::$app->response->redirect($newUrl)->send();
            exit;
        }
        $this->region = $regions[$prefixes[$prefix]['region']];
        Yii::$app->params['region'] = $prefixes[$prefix]['region'];
        Yii::$app->language = $prefixes[$prefix]['language'];
        $lang = $langReverse[$prefixes[$prefix]['language']];
        Yii::$app->params['url_prefix'] = $prefix;
        Yii::$app->params['lang_code'] = $lang;
        unset($path[0]);
        $request->pathInfo = implode('/', $path);
        $request->url = '/'. $request->pathInfo . (isset($urlArr[1]) ? '?' . $urlArr[1] : '') ;
        //ddd($this->region, Yii::$app->params['region'], Yii::$app->language, $lang, $prefix, $request->pathinfo, $request->url);
    }

    $host=$request->headers['host'];

    Yii::$app->homeUrl = $host;

    Yii::$app->params['transform_language_list'] = [];
    foreach (Yii::$app->params['regions_list'] as $key => $region) {
        foreach ($region['langList'] as $lang_key => $language) {
            Yii::$app->params['transform_language_list'][$lang_key]['code'] = $language;
            Yii::$app->params['transform_language_list'][$lang_key]['name'] = isset(Yii::$app->params['language_list'][$language]) ?
                Yii::$app->params['language_list'][$language] : $language;
            Yii::$app->params['transform_language_list'][$lang_key]['regions'][$key] = $region;
        }
    }

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