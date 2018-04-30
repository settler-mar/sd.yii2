<?php

namespace common\components;

use yii\base\Component;
use keltstr\simplehtmldom\SimpleHTMLDom as SHD;


/**
 * html - ищем заданные теги и вписываем для них заданные классы
 * Class TagsClasses
 * @package common\components
 */
class TagsClasses
{

    /**
     * @param $content
     * @param $classes
     * @param array $options
     * @return bool|\keltstr\simplehtmldom\simple_html_dom
     */
    public static function add($content, $classes = [], $options = [])
    {
        if (empty($content) || empty($classes)) {
            return $content;
        }
        //только если класс пустой
        $onlyEmpty = isset($options['only_empty']) ? $options['only_empty'] : true;

        $dom = SHD::str_get_html($content);
        foreach ($classes as $tag => $classNames) {
            $elements = $dom->find($tag);
            foreach ($elements as $element) {
                $element->class = !$element->class ? $classNames :
                    ($onlyEmpty ? $element->class : $element->class .' '.$classNames);
            }
        }
        return $dom;
    }

}