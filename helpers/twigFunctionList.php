<?php
use frontend\modules\constants\models\Constants;
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

function create_flash($type,$flashe){
  $title = false;
  $no_show_page=false;
  if (is_array($flashe)) {
    if (isset($flashe['title'])) $title = trim($flashe['title'],'.');
    if (isset($flashe['no_show_page'])) $no_show_page = $flashe['no_show_page'];
    $txt = trim($flashe['message'],'.');
  }else{
    $txt=$flashe;
  }
  if ($txt == 'Просмотр данной страницы запрещен.' && Yii::$app->user->isGuest) {
    $txt = 'Для доступа к личному кабинету вам необходимо <a href="#login">авторизоваться</a> на сайте.';
  }
  $js_t = 'notification.notifi({message:\'' . $txt . '\',type:\'' . $type . '\'' . ($title ? ',title:\'' . $title . '\'' : '') . '});' . "\n";
  if($no_show_page){
    $if_ls=[];
    foreach ($no_show_page as $url){
      $if_ls[]='href.indexOf(\''.$url.'\')<0';
    }
    $js_t='href=location.href;
              if('.implode(' && ',$if_ls).')
              {'.$js_t.'}';
  }
  return $js_t;
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
    //$httpQurey =  $_SERVER['REQUEST_URI'];
    $httpQuery = '/' . Yii::$app->request->pathInfo;
    if (!count($item)) {
      return null;
    }
    return '<a class="'.(empty($item['class']) ? '' : $item['class'] ).
    (($httpQuery == $item['href'])? ' active' : '').'" '
    .(($httpQuery == $item['href'])? '' : 'href="'.$item['href'].'"') .'>'.
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
  '_cashback'=> function ($cashback, $currency='',$action = 0,$mode = 0) use ($currencyIcon) {
    if($action == 1){
      $value = preg_replace('/[^0-9\.]/', '', $cashback);
      $cashback = str_replace($value,$value*2,$cashback);
    }
    $cur='';
    if(strpos($cashback, '%') === false){
      if ($mode == 0) {
        $cur = (isset($currencyIcon[$currency]) ? $currencyIcon[$currency] : $currency);
      }
      if ($mode == 1) {
        $cur = $currency;
      }
    }
    return trim($cashback .' '. $cur);
  },
  //функция - вывести кэшбек шопа в списках если нулевой, то сердечки
  '_shop_cashback'=> function ($cashback, $currency='', $action = 0) use ($currencyIcon) {
    $value = floatval(preg_replace('/[^0-9\.]/', '', $cashback));
    if ($action == 1) {
      $cashback = str_replace($value, $value * 2, $cashback);
    }

    if ($value == 0) {
      $out = '{{svg("heart","heart-red")|raw}}';
    } elseif (strpos($cashback, '%') === false) {
      $out = $cashback . ' ' .
        (isset($currencyIcon[$currency]) ? $currencyIcon[$currency] : $currency);
    } else {
      $out = $cashback;
    }
    return trim($out);
  },
  //для шопов - благотворительность, если кэебэк не возвращается, то 10% в метатегах
  '_check_charity' => function ($cashback) {
    if (empty($cashback)) {
      return '10%';
    }
    $value = floatval(preg_replace('/[^0-9\.]/', '', $cashback));
    if (empty($value)) {
      return '10%';
    }
    return $cashback;
  },
  //проверка, что значение null или 0 или цифровая часть 0 0.0
  '_is_empty' =>function($value) {
    if (empty($value)) {
      return true;
    }
    $value = floatval(preg_replace('/[^0-9\.]/', '', $value));
    if (empty($value)) {
      return true;
    }
    return false;
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
  '_nf'=>function($s,$k=2,$minus_test = true,$separate="&nbsp;",$wrap=false){
    if($minus_test && $s<0){
      $s=0;
    }
    $out= number_format($s,$k,'.',"&nbsp;");

    if($separate!="&nbsp;"){
      $out=str_replace("&nbsp;",$separate,$out);
    }
    if($wrap==1){
      for($i=0;$i<10;$i++){
        $out=str_replace($i,'<span>'.$i.'</span>',$out);
      }
    }
    return $out;
  },
  '_if'=>function($is,$then=false,$else=false){
    if($is){
      return ($then?$then:'');
    }else{
      return ($else?$else:'');
    }
  },
  '_date'=>function ($date,$format_time="%H:%M:%S") use ($month) {
    if(!$date){return false;};
    $d = explode(" ", $date)[0];
    $m = explode("-", $d);
    $currMonth = (isset($month[$m[1]])) ? $month[$m[1]] : strftime('%B', strtotime($date));
    return strftime("%e " . $currMonth . " %G в ".$format_time, strtotime($date));
  },
  '_local_date'=>function ($date, $format="%G %B %e %H:%I:%S") use ($month) {
    $monthRus = strpos($format, '%BRUS');
    $date = strtotime($date);
    if (!$monthRus) {
        return strftime($format, $date);
    }
    $m = date('m', $date);
    $currMonth = (isset($month[$m])) ? $month[$m] : strftime('%B', $date);
    return strftime(substr($format, 0, $monthRus), $date).$currMonth.strftime(substr($format, $monthRus + 5), $date);
  },
  'date'=>function ($date) use ($month) {
    $d = date('d',$date);
    $m = date('m',$date);
    $currMonth = (isset($month[$m])) ? $month[$m] : strftime('%B', strtotime($date));
    return $d.' '.$currMonth.' '.date('Y',$date);
  },
  'parts'=>function ($part) {
    return '/parts/'.$part.'.twig';
  },
  '_include'=>function ($part) {
    $path=Yii::getAlias('@app').'/views/parts/'.$part.'.twig';

    if(!is_readable($path)){
      return '<pre>Фаил не найден '.$path.'</pre>';
    }

    $output=file_get_contents($path);
    $output=Yii::$app->TwigString->render(
      $output,
      Yii::$app->params['all_params']
    );
    return $output;
  },
  'test_image'=>function ($path) {
    if(strlen($path)<5) return false;
    if(strpos($path,'http')!==false) return true;
    if(strpos($path,'//')!==false) return true;

    $path=str_replace('//','/',__DIR__.'/../frontend/web/'.$path);
    return file_exists($path);
  },
  'email_to_name'=>function ($email) {
    $email=explode('@',$email);
    return $email[0];
  },
  '_n_to_br'=>function ($txt) {
    return str_replace("\n",'<br>',$txt);
  },
  'Notification'=>function () {
    //$flashes = \Yii::$app->session->getAllFlashes(true);
    $flashes = \Yii::$app->session->getAllFlashes();

    if(isset(Yii::$app->params['exception'])){
      $exception=Yii::$app->params['exception'];
      $pathInfo = Yii::$app->request->getPathInfo();
      $msg=$exception->getMessage();
      if(
        (
          (
            strpos($pathInfo,'admin')===false AND
            strpos($msg,'Creating default')===false
          )||(
            !Yii::$app->user->isGuest && Yii::$app->user->can('adminIndex')
          )
        ) &&
        $msg!=='User not found'
      ){
        if(!isset($flashes['err'])){
          $flashes['err']=array();
        }
        $flashes['err'][]=$msg;
      };
    }

    if (count($flashes) == 0) {
      return '';
    }

    $js = '';
    $flashes=array_reverse($flashes);
    foreach ($flashes as $type => $flashe) {
      //Yii::$app->session->removeFlash($type);
      if (is_array($flashe)){
        if (isset($flashe['title']) && isset($flashe['message'])) {
          $js .= create_flash($type,$flashe);
        } else {
          foreach ($flashe as $txt) {
            $js .= create_flash($type,$txt);
          }
        }
      } elseif (is_string($flashe)) {
        $js .= create_flash($type,$flashe);
      }
    }
    return '<script type="text/javascript">' . "\n" . $js . '</script>';
  },
  'getShop'=>function ($id) {
    return \frontend\modules\stores\models\Stores::findOne(['uid'=>$id]);
  },
  '_can'=>function ($do) {
    return !Yii::$app->user->isGuest && Yii::$app->user->can($do);
  },
  '_ddd'=>function ($params) {
    ddd($params);
  },
  't'=>'Yii::t',
  'svg'=>function ($name,$class=false) {
    $path=Yii::getAlias('@app').'/views/svg/'.$name.'.svg';

    if(!is_readable($path)){
      return '<pre>Фаил не найден '.$path.'</pre>';
    }

    $output=file_get_contents($path);
    if($class){
      $output=str_replace('<svg','<svg class="'.$class.'" ',$output);
    }
    return $output;
  },
];

return $functionsList;
