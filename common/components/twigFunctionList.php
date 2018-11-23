<?php
use frontend\modules\constants\models\Constants;
use frontend\components\Action;
use common\components\Help;
use common\components\TagsClasses;
use yii\db\Query;
use frontend\modules\stores\models\Stores;

$currencyIcon = [
//    'RUB' => 'ruble',
//    'EUR' => 'euro',
//    'USD' => 'dollar',
];

function mb_lcfirst($str){
  $first = mb_substr($str,0,1);//первая буква
  $last = mb_substr($str,1);//все кроме первой буквы
  $first = mb_strtoupper($first);
  $last = mb_strtolower($last);
  return $first.$last;
}

function _hyphen_words_wbr(array &$m)
{
  return _hyphen_words($m, true);
}

function create_flash($type, $flashe)
{
  $title = false;
  $no_show_page = false;
  if (is_array($flashe)) {
    if (isset($flashe['title'])) $title = trim($flashe['title'], '.');
    if (isset($flashe['no_show_page'])) $no_show_page = $flashe['no_show_page'];
    $txt = $flashe['message'];
  } else {
    $txt = $flashe;
  }
  if ($txt == 'Просмотр данной страницы запрещен.' && Yii::$app->user->isGuest) {
    $txt = Yii::t('common','not_found_mast_login',['href'=>Help::href("#login")]);
  }
  if (mb_strlen($txt) < 5) {
    return '';
  }
  $js_t = 'notification.notifi({message:\'' . $txt . '\',type:\'' . $type . '\'' . ($title ? ',title:\'' . $title . '\'' : '') . '});' . "\n";
  if ($no_show_page) {
    $if_ls = [];
    foreach ($no_show_page as $url) {
      $if_ls[] = 'href.indexOf(\'' . $url . '\')<0';
    }
    $js_t = 'href=location.href;
              if(' . implode(' && ', $if_ls) . ')
              {' . $js_t . '}';
  }
  return $js_t;
}

function _hyphen_words(array &$m, $wbr = false)
{
  if (!array_key_exists(3, $m)) return $m[0];
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

  if ($wbr) {
    $s = preg_replace($rules, "$1<wbr>$2", $s);
  } else {
    #\xc2\xad = &shy;  U+00AD SOFT HYPHEN
    $s = preg_replace($rules, "$1\xc2\xad$2", $s);
  }
  return $s;
}

function getChildCurrent($category) {
    foreach ($category['childs'] as $child ) {
        if ($child['current']) {
            return true;
        }
        return getChildCurrent($child);
    }
}

/**константу или так отдаём или рендерим
 * @param $name
 * @param bool $json_col
 * @param int $json_index
 * @return string
 */
function getConstant($name, $json_col = false, $json_index = 0) {
    $constant = Constants::byName($name, $json_col, $json_index);
    if ($constant && isset($constant['ftype']) && in_array($constant['ftype'], ['textarea', 'reachtext'])) {
        return Yii::$app->TwigString->render($constant['text'], Yii::$app->view->all_params);
    } elseif ($constant && isset($constant['text'])) {
        return $constant['text'];
    } else {
        return $constant;
    }
}

$functionsList = [
//вывод одного элемента меню врутри <li> ... </li>
  'get_menu_item' => function ($item) {
    //$lg = Yii::$app->params['lang_code'];
    $lg = isset(Yii::$app->params['lang_code']) ?
          Yii::$app->params['lang_code'] :
          Yii::$app->params['regions_list'][Yii::$app->params['region']]['langDefault'];
    $lg = $lg == Yii::$app->params['regions_list'][Yii::$app->params['region']]['langDefault'] ? '' : $lg;
    $href = ($lg == '' || (isset($item['outer']) && $item['outer'] == 1)  ? '' : '/'.$lg) . ($item['href'] ? $item['href'] : '');

    $httpQuery = '/' . Yii::$app->request->pathInfo;
    $className = (empty($item['class']) ? '' : $item['class']) . (($httpQuery == $item['href']) ? ' active' : '');
    if (!count($item)) {
      return null;
    }
    $attributes = '';
    if (isset($item['attributes'])) {
        foreach ($item['attributes'] as $key=>$attribute) {
            $attributes .= (' '.$key.'="'.$attribute.'"');
        }
    }
    $title = (isset($item['left-icon']) ? '<span>' . Help::svg($item['left-icon'], 'left-icon') . $item['title'] . '</span>' : $item['title']) .
        (isset($item['right-icon']) ? Help::svg($item['right-icon'], 'right-icon') : '');
    return '<a '.($className ? 'class="' . trim($className) . '"' : '') . $attributes .
        ($httpQuery == $item['href'] ? '' : 'href="' . $href . '"') . '>' .
    $title . '</a>';
  },
//ссылка на внутренний ресурс с учётом языка
   '_href' => function($href, $basePath = ''){
      //$is_hash=($href[0]=='#');
     //mb_internal_encoding("UTF-8");
      //if($is_hash)$href=mb_substr( $href, 1);
      //ddd($href);
       return Help::href($href, $basePath);
   },
//функция or - вывод первого непустого аргумента
  '_or' => function () {
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
  '_no_br' => function ($content) {
    return str_replace('<br>', '', $content);
  },
  'json_decode' => function ($content) {
    return json_decode($content, true);
  },
  'json_encode' => function ($content) {
    return json_encode($content);
  },
//функция отдать константу по имени
  '_constant' => function ($name, $json_col = false, $json_index = 0) {
    return getConstant($name, $json_col, $json_index);
  },
  'currencyIcon' => function ($currency) use ($currencyIcon) {
    return Yii::t('main',$currency);
    /*return (isset($currencyIcon[$currency]) ? Help::svg(
        $currencyIcon[$currency],
        'currency-icon currency-icon-' . $currencyIcon[$currency]
    ) : $currency);*/
  },
  'get_store' => function($store_id){
    return \frontend\modules\stores\models\Stores::findOne(['uid'=>$store_id]);
  },
  //Универсальная ф-я вывода блока ставки кэшбэка в ависимости от типа
  'cashback' =>function($store,$params_id){
    return Yii::$app->help->cashback($store,$params_id);
  },
//функция - вывести кешбек  и валюту, если не задан процента кешбека для шопа
  '_cashback' => function ($cashback, $currency = '', $action = 0, $mode = 0) use ($currencyIcon) {
    $cashback = str_replace('до', Yii::t('main', 'up_to'), $cashback);
    if ($action == 1) {
      $value = preg_replace('/[^0-9\.\,]/', '', $cashback);
      $cashback = str_replace($value, $value * 2, $cashback);
    }
    $cur = '';
    if (strpos($cashback, '%') === false) {
      if ($mode == 0) {
        $cur = (isset($currencyIcon[$currency]) ? Help::svg(
            $currencyIcon[$currency],
            'currency-icon currency-icon-' . $currencyIcon[$currency]
        ) : ' '.$currency);
      }
      if ($mode == 1) {
        $cur = ' '.$currency;
      }
    }
    return trim($cashback . $cur);
  },
//функция - вывести кэшбек шопа в списках если нулевой, то сердечки $pre - символы перед, если не благотворительный
  '_shop_cashback' => function ($cashback, $currency = '', $action = 0, $pre = '',$heart_if_zero = true) use ($currencyIcon) {
    $cashback = str_replace('до', Yii::t('main', 'up_to'), $cashback);
    $value = preg_replace('/[^\.\,0-9]/', '', $cashback);
    if ($value=="")$value=0;
    if ($action == 1) {
      $cashback = str_replace($value, $value * 2, $cashback);
    } else {
      $v = $value * 1;
      //$v=$v/10;
      $cashback = str_replace($value, $v, $cashback);
    }
    if ($heart_if_zero && $value == 0) {
      $out = '{{svg("heart","heart-red shop-heart-red")|raw}}';
    } elseif (strpos($cashback, '%') === false) {
      $out = $pre . $cashback .
          (isset($currencyIcon[$currency]) ?
              '{{svg("' . $currencyIcon[$currency] . '","currency-icon currency-icon-' . $currencyIcon[$currency] . '")|raw}}' :
              ' '.$currency);
    } else {
      $out = $pre . $cashback;
    }
    return trim($out);
  },
//для шопов - благотворительность, если кэебэк не возвращается, то 10% в метатегах и перевод "до "
  '_check_charity' => function ($cashback, $currency = '') {
    if (empty($cashback)) {
      return '10%';
    }
    $value = floatval(preg_replace('/[^0-9\.]/', '', $cashback));
    if (empty($value)) {
      return '10%';
    }
    $result = strpos($cashback, 'до') !== false ? Yii::t('main', 'up_to') . ' ' : '';
    $result .= $value;
    $result .= strpos($cashback, '%') !== false ? '%' : ($currency ? ' ' . $currency : '');

    return $result;
  },
//проверка, что значение null или 0 или цифровая часть 0 0.0
  '_is_empty' => function ($value) {
    if (empty($value)) {
      return true;
    }
    $value = floatval(preg_replace('/[^0-9\.]/', '', $value));
    if (empty($value)) {
      return true;
    }
    return false;
  },

  '_hyphen_words' => function ($s, $wbr = true) {
    #регулярное выражение для атрибутов тагов
    #корректно обрабатывает грязный и битый HTML в однобайтовой или UTF-8 кодировке!
    $re_attrs_fast_safe = '(?> (?>[\x20\r\n\t]+|\xc2\xa0)+  #пробельные символы (д.б. обязательно)
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

    if ($wbr) {
      $txt = preg_replace_callback($regexp, '_hyphen_words_wbr', $s);
    } else {
      $txt = preg_replace_callback($regexp, '_hyphen_words', $s);
    }

    return $txt;
  },
  '_hyphen_email' => function ($s) {
    $s = explode("@", $s);
    $s = implode('@<wbr>', $s);
    return $s;
  },
  '_nf' => function ($s, $k = 2, $minus_test = true, $separate = "&nbsp;", $wrap = false) {
    if ($minus_test && $s < 0) {
      $s = 0;
    }
    $s = (float)$s;
    $out = number_format($s, $k, '.', "&nbsp;");

    if ($separate != "&nbsp;") {
      $out = str_replace("&nbsp;", $separate, $out);
    }
    if ($wrap == 1) {
      for ($i = 0; $i < 10; $i++) {
        $out = str_replace($i, '<span>' . $i . '</span>', $out);
      }
    }
    return $out;
  },
  '_if' => function ($is, $then = false, $else = false) {
    if ($is) {
      return ($then ? $then : '');
    } else {
      return ($else ? $else : '');
    }
  },
  '_date' => function ($date, $format_time = "%H:%M:%S", $locate_month = true) {
    if (!$date) {
      return false;
    };
    $d = explode(" ", $date)[0];
    $m = explode("-", $d);
    if ($locate_month) {
      $currMonth = Yii::t('common','months_'.$m[1]);
      $sep = ' ';
    } else {
      $currMonth = $m[1];
      $sep = '/';
    }
    if ($format_time) {
      return strftime("%e " . $currMonth . " %G ".Yii::t('common','months_in')." " . $format_time, strtotime($date));
    } else {
      return strftime("%e " . $currMonth . " %G", strtotime($date));
    }
  },
  '_local_date' => function ($date = '', $format = "%G %B %e %H:%I:%S", $nominative = false) {
    $month = $nominative ? "month_" : "months_";
    $date = $date == '' ? date('Y-m-d H:i:s', time()) : $date;
    $monthRus = strpos($format, '%BRUS');
    $date = strtotime($date);
    if ($monthRus === false) {
      return strftime($format, $date);
    }
    $m = date('m', $date);
    $currMonth = Yii::t('common',$month.$m);
    return strftime(substr($format, 0, $monthRus), $date) . $currMonth . strftime(substr($format, $monthRus + 5), $date);
  },
  'year' => function ($date = false) {
    if ($date === 0) {
      return '';
    }
    if ($date === false){
      $date = time();
    }
    return date('Y',$date);
  },
  'month'=> function ($d = 0) {

    $m = date('m');

    $month = "month_";

    $nm=$m+$d;
    if($nm>12)$nm-=12;
    if($nm<1)$nm+=12;

    if($nm<10)$nm="0".$nm;
    $nm = Yii::t('common',$month.$nm);
    //ddd($pm);

    return mb_lcfirst($nm);
  },
  'date' => function ($date, $format_time = false, $locate_month = true) {
    if ($date == 0) {
      return '';
    }
    $d = date('d', $date);
    $m = date('m', $date);

    if ($locate_month) {
      $currMonth = Yii::t('common',"months_".$m);
      $sep = ' ';
    } else {
      $currMonth = $m;
      $sep = '/';
    }
    return $d . $sep . $currMonth . $sep . date('Y', $date) . ($format_time ? ' ' . date($format_time, $date) : '');
  },
  'parts' => function ($part) {
    return '/parts/' . $part . '.twig';
  },
  '_include' => function ($part, $params = array()) {
    $path = Yii::getAlias('@app') . '/views/parts/' . $part . '.twig';

    if (!is_readable($path)) {
      return '<pre>Фаил не найден ' . $path . '</pre>';
    }

    $params = array_merge($params, Yii::$app->params['all_params']);
    $output = file_get_contents($path);
    $output = Yii::$app->TwigString->render(
        $output,
        $params
    );
    return $output;
  },
  'test_image' => function ($path) {
    if (strlen($path) < 5) return false;
    if (strpos($path, 'http') !== false) return true;
    if (strpos($path, '//') !== false) return true;

    $path = str_replace('//', '/', __DIR__ . '/../frontend/web/' . $path);
    return file_exists($path);
  },
  'email_to_name' => function ($email) {
    $email = explode('@', $email);
    return $email[0];
  },
  '_n_to_br' => function ($txt) {
    return str_replace("\n", '<br>', $txt);
  },
  'Notification' => function () {
    $flashes = \Yii::$app->session->getAllFlashes();

    if (isset(Yii::$app->params['exception'])) {
      $exception = Yii::$app->params['exception'];
      $pathInfo = Yii::$app->request->getPathInfo();
      $msg = $exception->getMessage();
      if (
          (
              (
                  strpos($pathInfo, 'admin') === false AND
                  strpos($msg, 'Creating default') === false
              ) || (
                  !Yii::$app->user->isGuest && Yii::$app->user->can('adminIndex')
              )
          ) &&
          $msg !== 'User not found'
      ) {
        if (!isset($flashes['err'])) {
          $flashes['err'] = array();
        }
        $flashes['err'][] = $msg;
      };
    }

    if (count($flashes) == 0) {
      return '';
    }

    $js = '';
    $html = '';
    $flashes = array_reverse($flashes);
    foreach ($flashes as $type => $flashe) {
      //Yii::$app->session->removeFlash($type);
      if (is_array($flashe)) {
        if (isset($flashe['title']) && isset($flashe['message'])) {
          $js .= create_flash($type, $flashe);
        } else {
          foreach ($flashe as $txt) {
            if ($type == 'constant') {
                $html .= getConstant($txt);
            } else {
                $js .= create_flash($type, $txt);
            }
          }
        }
      } elseif (is_string($flashe)) {
        if ($type == 'constant') {
            $html .= getConstant($flashe);
        } else {
            $js .= create_flash($type, $flashe);
        }
      }
    }
    return $html . ($js ? '<script type="text/javascript">' . "\n" . $js . "\n". '</script>' : '');
  },
  'getShop' => function ($id) {
    return \frontend\modules\stores\models\Stores::byId($id);
  },
  '_can' => function ($do) {
    return !Yii::$app->user->isGuest && Yii::$app->user->can($do);
  },
  '_ddd' => function ($params) {
    ddd($params);
  },
  '_checkAvatar' => function ($avatar, $techAvatar = '/images/no_ava_square.png') {
    if (!$avatar) {
      return $techAvatar;
    } elseif (strpos($avatar, 'http') !== false or strpos($avatar, '//') !== false) {
      $avatar = str_replace('http:', 'https:', $avatar);
      //Это только на стороне клиента. При большом кол-ве картинок на странице тупо повесишь сервер
      /*$curl = curl_init();
      curl_setopt($curl, CURLOPT_URL, $avatar);
      curl_setopt($curl, CURLOPT_NOBODY, 1);
      curl_setopt($curl, CURLOPT_FAILONERROR, 1);
      curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
      $response = curl_exec($curl);
      curl_close($curl);
      return $response !== false ? $avatar : $techAvatar;*/
      return $avatar;
    } elseif (is_readable(Yii::getAlias('@webroot') . $avatar)) {
      return $avatar;
    } else {
      return $techAvatar;
    }
  },
  '_coupons_news_count' => function () {
    return frontend\modules\coupons\models\Coupons::activeCount('news');
  },
  't' => 'Yii::t',
  'max' => 'max',
  'implode' => 'implode',
  'sin' => 'sin',
  'str_replace' => 'str_replace',
  'in_array' => 'in_array',
  '_php_date' => 'date',
  'exchange' => function ($val,$on,$to){
      $kurs = Yii::$app->conversion->getCurs($to,$on);
      return ($kurs*$val);
  },
  'is_empty' =>  function ($data) {
    $data = trim($data);
    return empty($data);
  },
  'not_zero' =>  function ($str) {
    $str=preg_match_all('!\d+!', $str, $matches);
    foreach ($matches[0] as $n){
      if($n!=0)return true;
    }
    return false;
  },
  'svg' => function ($name, $class = false, $alias = '@app') {
    return Help::svg($name, $class, $alias);
  },
  'params' => function () {
    $names=func_get_args();
    if(count($names)==0)return "";
    $params=Yii::$app->params;
    foreach ($names as $name){
      if (isset($params[$name])) {
        $params = $params[$name];
      } else {
        return null;
      }
    }
    return $params;
  },
  'getOperatorLogo' => function ($data) {
    $cash_name = 'mobile_'.$data['country'] . '_' . $data['operator'];
    return Yii::$app->cache->getOrSet($cash_name, function () use ($data) {
      $sql='SELECT * FROM opsos_prefix 
              LEFT JOIN opsos ON opsos.opsos_id=opsos_prefix.prefix_opsos_id 
              WHERE prefix_country="'.$data['country'].'" AND prefix_def="'.$data['operator'].'"';
      $query = Yii::$app->db->createCommand($sql)->queryOne();

      if(!$query)return '';

      return '<img class="mobile_operator_logo" alt="'.$query['opsos_name'].'" src="/images/mobile_operator/'.$query['opsos_image'].'.gif">';
    });
  },
  '_ucfirst' => function($value) {
        return ucfirst($value);
  },

  '_strtolower' => function($value) {
      return strtolower($value);
  },
  '_tags_class' => function($content, $tags_list = [], $options = []){
    return TagsClasses::add($content, $tags_list, $options);
  },
  '_region' =>  function($name = 'name'){
    return getConstant('region_names',0, $name);
  },
  '_regions_include' => function($params){
    //на форму редактирования констант json регионы из настроек
    if (isset($params['columns'])) {
      foreach($params['columns'] as &$column) {
        if (isset($column['name']) && $column['name'] == 'regions') {
          $regions = [];
          foreach (Yii::$app->params['regions_list'] as $key => $region) {
            $regions[$key] = $region['name'];
          }
          $column['items'] = $regions;
        }
      }
    }
    return $params;
  },
  '_regions_constant_config' => function(){
      $out = ['allowEmptyList'=> true, 'columns' =>[['name'=>'code', 'title'=>'Code']]];
      foreach (Yii::$app->params['regions_list'] as $regionKey => $region) {

          $out['columns'][] = ['name' => $regionKey, 'title' => $region['name']];
      }
      //ddd($out);
      return $out;
  },
  '_render' => function($content){
    return Yii::$app->TwigString->render($content, Yii::$app->view->all_params);
  },
  '_getFilterAdd' => function($params, $get, $arrayName) {
    //добавляем(обновлям) $params в $get[$arrayName]  и формируем гет-запрос из $get[$arrayName]
      if (!isset($get[$arrayName])) {
          $get[$arrayName] = [];
      }
      $get[$arrayName] = array_merge($get[$arrayName], $params);
      $res = [];
      foreach ($get[$arrayName] as $key => $item) {
          $res[$arrayName.'['.$key.']'] = $item;
      }
      $query = http_build_query($res);
      return $query ? '?'.$query : '';
  },
    '_action' => function($id, $options =[]){
    return Action::widget(['id' => $id, 'options' => $options]);
  },
  '_hide_email' => function($email) {
     return preg_replace('/.{2,4}\@/', '****@', $email);
  },
  '_eol' => function($value, $width = 40) {
    $value=trim(strip_tags($value));

    if(mb_strlen($value)<$width)return $value; //добавил что б лишний раз не гонять цикл

    //меняем пробелы поблизе к $width на перевод строки
    //Причина создания: Нарушение вёрстки длинным alt-ом на карточке шопа

    $value=explode(' ',$value);
    $result = '';
    $i=0;
    while (mb_strlen($result)<$width && $i<count($value)) {
      if(mb_strlen($value[$i])<1){
        $i++;
        continue;
      }
      if(mb_strlen($value[$i])+mb_strlen($result)>$width){
        return trim($result);
      }
      $result.=' '.$value[$i];
      $i++;
    }
    return trim($result);
  },
  'loyalty' => function($name, $code) {
    $cur=Yii::$app->user->isGuest?Yii::$app->params['valuta']:Yii::$app->user->identity->currency;
    $loyalty_status=(Yii::$app->params['dictionary']['loyalty_status']);
    foreach ($loyalty_status as $data){
      if($data['name']==$name) break;
    }
    if($data['name']!=$name) return '';
    if(!isset($data[$code])) return '';
    if(is_array($data[$code])){
      if(!isset($data[$code][$cur]))return '';
      return $data[$code][$cur].' '.Yii::t('main',$cur);
    }else{
      return $data[$code];
    };
  },
  '_void' => function($argument) {
    return '';
  },
  'top_store' => function($region = 'default') {
    $stores = Stores::top12($region);
    $layout = Yii::$app->viewPath . '/parts/stores/mail_top.twig';
    if (!file_exists($layout)) {
        return 'file not fount '.$layout;
    }
    $layout = file_get_contents($layout);
    return Yii::$app->TwigString->render($layout, ['stores' => $stores]);
  },
  '_is_category_open' => function($category) {
    //проходим по всем дочерним категориям, если есть current возвращаем true
      return getChildCurrent($category);
  },
  '_num_text' => function($number) {
    $number = (integer) $number;
    if ($number / 1000000000 > 1) {
        return round($number / 1000000000).' <span>'.Yii::t('common','billion').'</span>';
    } else if ($number / 1000000 > 1) {
        return round($number / 1000000).' <span>'.Yii::t('common','million').'</span>';
    } else if ($number / 1000 > 1) {
        return round($number / 1000).' <span>'.Yii::t('common','thousand').'</span>';
    } else {
        return $number;
    }
  },


];

return $functionsList;
