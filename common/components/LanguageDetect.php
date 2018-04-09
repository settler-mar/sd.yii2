<?php

namespace common\components;

use yii\base\Component;
use TextLanguageDetect\TextLanguageDetect;
use TextLanguageDetect\LanguageDetect\TextLanguageDetectException;
use TextLanguageDetect\LanguageDetect\TextLanguageDetectISO639;

class LanguageDetect extends Component
{
    protected $languageDetector;
    protected $languageArray;

    public function init()
    {
        $this->languageDetector = new TextLanguageDetect();
        $this->languageDetector->setNameMode(2);
        $this->languageArray = $this->makeLanguagesArray(TextLanguageDetectISO639::$nameToCode2);
    }


    public function detect($text)
    {
        try {
            $language = $this->languageDetector->detect($text);
            return count($language) ? array_keys($language)[0] : null;
        } catch (TextLanguageDetectException $e) {
            //
        }
    }

    public function getLanguages()
    {
        return $this->languageArray;
    }

    private function makeLanguagesArray($isoLanguages)
    {
        $languages = array_flip(array_diff($isoLanguages, [null]));
        foreach ($languages as &$language) {
            $language = ucfirst($language);
        }
        return $languages;
    }
}