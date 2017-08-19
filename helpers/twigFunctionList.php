<?php
use app\modules\constants\models\Constants;
$currencyIcon = [
  'RUB' => '<span class="fa fa-rub"></span>',
  'EUR' => '<span class="fa fa-eur"></span>',
  'USD' =>'<span class="fa fa-dollar"></span>',
  'UAH' => '<span class="uah">&#8372;</span>',
  'KZT' => '<span class="uah">&#8376;</span>',
];
$month = [
    '00' => '',
    '01' => 'января', '02' => 'февраля', '03' => 'марта',
    '04' => 'апреля', '05' => 'мая', '06' => 'июня',
    '07' => 'июля', '08' => 'августа', '09' => 'сентября',
    '10' => 'октября', '11' => 'ноября', '12' => 'декабря'
];

function _hyphen_words_wbr(array &$m){
  return _hyphen_words($m,true);
}

function _hyphen_words(array &$m,$wbr=false)
{
  if (! array_key_exists(3, $m)) return $m[0];
  $s =& $m[0];

  #буква (letter)
  $l = '(?: \xd0[\x90-\xbf\x81]|\xd1[\x80-\x8f\x91]  #А-я (все)
            | [a-zA-Z]
          )';

  #буква (letter)
  $l_en = '[a-zA-Z]';
  #буква (letter)
  $l_ru = '(?: \xd0[\x90-\xbf\x81]|\xd1[\x80-\x8f\x91]  #А-я (все)
             )';

  #гласная (vowel)
  $v = '(?: \xd0[\xb0\xb5\xb8\xbe]|\xd1[\x83\x8b\x8d\x8e\x8f\x91]  #аеиоуыэюяё (гласные)
            | \xd0[\x90\x95\x98\x9e\xa3\xab\xad\xae\xaf\x81]         #АЕИОУЫЭЮЯЁ (гласные)
            | (?i:[aeiouy])
          )';

  #согласная (consonant)
  $c = '(?: \xd0[\xb1-\xb4\xb6\xb7\xba-\xbd\xbf]|\xd1[\x80\x81\x82\x84-\x89]  #бвгджзклмнпрстфхцчшщ (согласные)
            | \xd0[\x91-\x94\x96\x97\x9a-\x9d\x9f-\xa2\xa4-\xa9]                #БВГДЖЗКЛМНПРСТФХЦЧШЩ (согласные)
            | (?i:sh|ch|qu|[bcdfghjklmnpqrstvwxz])
          )';

  #специальные
  $x = '(?:\xd0[\x99\xaa\xac\xb9]|\xd1[\x8a\x8c])';   #ЙЪЬйъь (специальные)

  /*
  #алгоритм П.Христова в модификации Дымченко и Варсанофьева
  $rules = array(
      # $1       $2
      "/($x)     ($l$l)/sx",
      "/($v)     ($v$l)/sx",
      "/($v$c)   ($c$v)/sx",
      "/($c$v)   ($c$v)/sx",
      "/($v$c)   ($c$c$v)/sx",
      "/($v$c$c) ($c$c$v)/sx"
  );

  #improved rules by Dmitry Koteroff
  $rules = array(
      # $1                      $2
      "/($x)                    ($l (?:\xcc\x81)? $l)/sx",
      "/($v (?:\xcc\x81)? $c$c) ($c$c$v)/sx",
      "/($v (?:\xcc\x81)? $c$c) ($c$v)/sx",
      "/($v (?:\xcc\x81)? $c)   ($c$c$v)/sx",
      "/($c$v (?:\xcc\x81)? )   ($c$v)/sx",
      "/($v (?:\xcc\x81)? $c)   ($c$v)/sx",
      "/($c$v (?:\xcc\x81)? )   ($v (?:\xcc\x81)? $l)/sx",
  );
  */

  #improved rules by Dmitry Koteroff and Rinat Nasibullin
  $rules = array(
    # $1                      $2
    "/($x)                    ($c (?:\xcc\x81)? $l)/sx",
    "/($v (?:\xcc\x81)? $c$c) ($c$c$v)/sx",
    "/($v (?:\xcc\x81)? $c$c) ($c$v)/sx",
    "/($v (?:\xcc\x81)? $c)   ($c$c$v)/sx",
    "/($c$v (?:\xcc\x81)? )   ($c$v)/sx",
    "/($v (?:\xcc\x81)? $c)   ($c$v)/sx",
    "/($c$v (?:\xcc\x81)? )   ($v (?:\xcc\x81)? $l)/sx",
  );



  if($wbr){
    $s = preg_replace($rules, "$1<wbr>$2", $s);
  }else{
    #\xc2\xad = &shy;  U+00AD SOFT HYPHEN
    $s = preg_replace($rules, "$1\xc2\xad$2", $s);
  }


  return $s;
}

$functionsList=[
  //вывод одного элемента меню врутри <li> ... </li>
  'get_menu_item'=>function ($item) {
    $httpQurey =  $_SERVER['REQUEST_URI'];
    if (!count($item)) {
      return null;
    }
    return '<a class="'.(empty($item['class']) ? '' : $item['class'] ).
    (($httpQurey == $item['href'])? ' active' : '').'" '
    .(($httpQurey == $item['href'])? '' : 'href="'.$item['href'].'"') .'>'.
    $item['title'] . '</a>';
  },
  //функция or - вывод первого непустого аргумента
  '_or'=> function () {
    if (!func_num_args()) {
      return null;
    }
    foreach (func_get_args() as $arg) {
      if (!empty($arg)) {
        return $arg;
      }
    }
    return null;
  },
  //функция убрать <br> из контента
  '_no_br'=> function ($content) {
    return str_replace('<br>', '', $content);
  },
  //функция отдать константу по имени
  '_constant'=> function ($name) {
    return Yii::$app->cache->getOrSet($name, function() use($name){
      $meta = Constants::find()->where(['name'=> $name])->select(['text'])->one();
      if ($meta){
        return $meta['text'];
      }else{
        return false;
      }
    });
  },
  //функция - вывести кешбек  и валюту, если не задан процента кешбека для шопа
  '_cashback'=> function ($cashback, $currency) use ($currencyIcon) {
    return $cashback . ((strpos($cashback, '%') === false) ? ' ' .
        (isset($currencyIcon[$currency]) ? $currencyIcon[$currency] : $currency) : '');
  },
  //функция - вывести кэшбек шопа в списках если нулевой, то сердечки
  '_shop_cashback'=> function ($cashback, $currency) use ($currencyIcon) {
    $value = preg_replace("/[^0-9]/", '', $cashback);
    if (intval($value) == 0) {
      return '<i class="red fa fa-heart"></i>';
    } elseif (strpos($cashback, '%') === false) {
      return $cashback . ' ' .
      (isset($currencyIcon[$currency]) ? $currencyIcon[$currency] : $currency);
    } else {
      return $cashback;
    }
  },

  '_hyphen_words'=>function ($s,$wbr=true){
    #регулярное выражение для атрибутов тагов
    #корректно обрабатывает грязный и битый HTML в однобайтовой или UTF-8 кодировке!
    $re_attrs_fast_safe =  '(?> (?>[\x20\r\n\t]+|\xc2\xa0)+  #пробельные символы (д.б. обязательно)
                                  (?>
                                    #правильные атрибуты
                                                                   [^>"\']+
                                    | (?<=[\=\x20\r\n\t]|\xc2\xa0) "[^"]*"
                                    | (?<=[\=\x20\r\n\t]|\xc2\xa0) \'[^\']*\'
                                    #разбитые атрибуты
                                    |                              [^>]+
                                  )*
                              )?';
    $regexp = '/(?: #встроенный PHP, Perl, ASP код
                      <([\?\%]) .*? \\1>  #1
  
                      #блоки CDATA
                    | <\!\[CDATA\[ .*? \]\]>
  
                      #MS Word таги типа "<![if! vml]>...<![endif]>",
                      #условное выполнение кода для IE типа "<!--[if lt IE 7]>...<![endif]-->"
                    | <\! (?>--)?
                          \[
                          (?> [^\]"\']+ | "[^"]*" | \'[^\']*\' )*
                          \]
                          (?>--)?
                      >
  
                      #комментарии
                    | <\!-- .*? -->
                    | {.*?}
                      #парные таги вместе с содержимым
                    | <((?i:noindex|script|style|comment|button|map|iframe|frameset|object|applet))' . $re_attrs_fast_safe . '> .*? <\/(?i:\\2)>  #2
  
                      #парные и непарные таги
                    | <[\/\!]?[a-zA-Z][a-zA-Z\d]*' . $re_attrs_fast_safe . '\/?>
  
                      #html сущности (&lt; &gt; &amp;) (+ корректно обрабатываем код типа &amp;amp;nbsp;)
                    | &(?>
                          (?> [a-zA-Z][a-zA-Z\d]+
                            | \#(?> \d{1,4}
                                  | x[\da-fA-F]{2,4}
                                )
                          );
                       )+
  
                      #не html таги и не сущности
                    | ([^<&]{2,})  #3
                  )
                 /sx';

    if($wbr){
      $txt= preg_replace_callback($regexp, '_hyphen_words_wbr', $s);
    }else{
      $txt= preg_replace_callback($regexp, '_hyphen_words', $s);
    }

    return $txt;
  },
  '_hyphen_email'=>function($s){
    $s=explode("@",$s);
    $s=implode('@<wbr>',$s);
    return $s;
  },
  '_nf'=>function($s,$k=2){
    return number_format($s,$k,'.','&nbsp;');
  },
  '_if'=>function($is,$then=false,$else=false){
    if($is){
      return ($then?$then:'');
    }else{
      return ($else?$else:'');
    }
  },
  '_date'=>function ($date) use ($month) {
    $d = explode(" ", $date)[0];
    $m = explode("-", $d);
    $currMonth = (isset($month[$m[1]])) ? $month[$m[1]] : strftime('%B', strtotime($date));
    return strftime("%e " . $currMonth . " %G в %H:%M:%S", strtotime($date));
  },

];

return $functionsList;