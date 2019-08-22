<?php

namespace api\components;

use Yii;
use yii\web\UrlRuleInterface;

class SdUrlEntity implements UrlRuleInterface
{
    private $region = 'ru';

    public function parseRequest($manager, $request)
    {
        $regionUsed = Yii::$app->params['regions_list'][$this->region];
        $languages = $regionUsed['langListActive'];
        $languageDefault = $regionUsed['langDefault'];

        Yii::$app->language = $regionUsed['langList'][$languageDefault];
        Yii::$app->params['region'] = $this->region;
        Yii::$app->params['lang_code'] = $languageDefault;

        $urlPath = explode('/', $request->pathInfo);
        $langCode = $urlPath[0];
        if (in_array($langCode, $languages)) {
            Yii::$app->language = $regionUsed['langList'][$langCode];
            Yii::$app->params['lang_code'] = $langCode;
            array_shift($urlPath);
            $urlArr = explode('?', $request->url);
            $request->pathInfo = implode('/', $urlPath);
            $request->url = '/' . $request->pathInfo . (isset($urlArr[1]) ? '?' . $urlArr[1] : '');
            if ($langCode == $languageDefault) {
                Yii::$app->response->redirect($request->url)->send();
                exit;
            }
        }
        return false;
    }

    public function createUrl($route, $params = [], $ampersand = '&')
    {
        return false;
    }
}