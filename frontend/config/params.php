<?php

$dict = $dict=require (__DIR__.'/../language/'.(defined('LANGUAGE') ? LANGUAGE : 'ru-RU') . '/dictionary.php');

return [
    'stores_menu_accordeon_collapsed' => 1,
    'dictionary' => $dict,

];
