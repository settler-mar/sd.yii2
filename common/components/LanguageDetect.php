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
        $this->languageArray = array_flip(array_diff(TextLanguageDetectISO639::$nameToCode2, [null]));
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
        $languages = $this->languageDetector->getLanguages();
        $result = [];
        foreach ($languages as $language) {
            if (!empty($this->languageArray[$language])) {
                $result[$language] = ucfirst($this->languageArray[$language]);
            }
        }
        //ddd($result);
        return $result;
    }
}