<?php

namespace common\components;

use yii\base\Component;
use TextLanguageDetect\TextLanguageDetect;
use TextLanguageDetect\LanguageDetect\TextLanguageDetectException;

class LanguageDetect extends Component
{
    protected $languageDetector;

    public function init()
    {
        $this->languageDetector = new TextLanguageDetect();
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
        return $this->languageDetector->getLanguages();
    }
}