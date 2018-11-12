<?php

namespace common\components;

use kartik\daterange\DateRangePicker;
use Yii;
use yii\base\Component;
use yii\helpers\ArrayHelper;

/**
 * Class Help
 * @package frontend\components
 */
class Help extends Component
{
  /**
   * Shielding the transmitted data
   * @param mixed
   * @return string
   */
  public static function shieldingData($data)
  {
    if ($data === null) {
      return null;
    }
    $data = strip_tags($data);
    $data = htmlentities($data, ENT_QUOTES, "UTF-8");
    $data = htmlspecialchars($data, ENT_QUOTES);
    $data = trim($data);

    return $data;
  }

  /**
   * Newline in translit
   * @param string $string
   * @return string
   */
  private static function rus2translit($string)
  {
    $converter = [
        'а' => 'a', 'б' => 'b', 'в' => 'v',
        'г' => 'g', 'д' => 'd', 'е' => 'e',
        'ё' => 'e', 'ж' => 'zh', 'з' => 'z',
        'и' => 'i', 'й' => 'y', 'к' => 'k',
        'л' => 'l', 'м' => 'm', 'н' => 'n',
        'о' => 'o', 'п' => 'p', 'р' => 'r',
        'с' => 's', 'т' => 't', 'у' => 'u',
        'ф' => 'f', 'х' => 'h', 'ц' => 'c',
        'ч' => 'ch', 'ш' => 'sh', 'щ' => 'sch',
        'ь' => '', 'ы' => 'y', 'ъ' => '',
        'э' => 'e', 'ю' => 'yu', 'я' => 'ya',
        'А' => 'A', 'Б' => 'B', 'В' => 'V',
        'Г' => 'G', 'Д' => 'D', 'Е' => 'E',
        'Ё' => 'E', 'Ж' => 'Zh', 'З' => 'Z',
        'И' => 'I', 'Й' => 'Y', 'К' => 'K',
        'Л' => 'L', 'М' => 'M', 'Н' => 'N',
        'О' => 'O', 'П' => 'P', 'Р' => 'R',
        'С' => 'S', 'Т' => 'T', 'У' => 'U',
        'Ф' => 'F', 'Х' => 'H', 'Ц' => 'C',
        'Ч' => 'Ch', 'Ш' => 'Sh', 'Щ' => 'Sch',
        'Ь' => '', 'Ы' => 'Y', 'Ъ' => '',
        'Э' => 'E', 'Ю' => 'Yu', 'Я' => 'Ya',
    ];
    return strtr($string, $converter);
  }

  /**
   * Newline in the url like
   * @param string $str
   * @return string
   */
  public static function str2url($str)
  {
    $str = self::rus2translit($str);
    $str = strtolower($str);
    $str = preg_replace('~[^-a-z0-9_]+~u', '-', $str);
    $str = trim($str, "-");
    return $str;
  }

  public function colorStatus($status, $showIcon = true, $status_list = false)
  {
    if (!$status_list) {
      $status_list = [
          'В ожидании',
          'Отклонён',
          'Подтверждён',
      ];
//      $status_list = [
//        \Yii::t('common', 'color_status_waiting'),
//        \Yii::t('common', 'color_status_revoked'),
//        \Yii::t('common', 'color_status_confirmed'),
//      ];
    };
    $icon_list = [
        '<span class="fa fa-clock-o"></span>',
        '<span class="fa fa-times"></span>',
        '<span class="fa fa-check"></span>',
    ];
    if (!isset($status_list[$status])) return '!!! ОШИБКА !!!';
    $out = '<span class="status_' . $status . '"">';

    if ($showIcon && isset($icon_list[$status])) {
      $out .= $icon_list[$status] . '&nbsp;';
    }
    $out .= $status_list[$status];
    $out .= '</span>';
    return $out;
  }

  public static function dateRanges()
  {
    return [
        Yii::t('common', 'today') => ["moment().startOf('day')", "moment()"],
        Yii::t('common', 'yesterday') => ["moment().startOf('day').subtract(1,'days')", "moment().endOf('day').subtract(1,'days')"],
        Yii::t('common', 'this_week') => ["moment().startOf('weak')", "moment()"],
        Yii::t('common', 'last_n_days', ['n' => 7]) => ["moment().startOf('day').subtract(6, 'days')", "moment()"],
        Yii::t('common', 'last_n_days', ['n' => 30]) => ["moment().startOf('day').subtract(29, 'days')", "moment()"],
        Yii::t('common', 'this_month') => ["moment().startOf('month')", "moment()"],
        Yii::t('common', 'last_month') => ["moment().subtract(1, 'month').startOf('month')", "moment().subtract(1, 'month').endOf('month')"],
        Yii::t('common', 'this_year') => ["moment().startOf('year')", "moment()"],
        Yii::t('common', 'last_year') => ["moment().subtract(1, 'year').startOf('year')", "moment().subtract(1, 'year').endOf('year')"],
    ];
  }

  public static function DateRangePicker($Model, $attrName, $option = array())
  {
    $option = ArrayHelper::merge([
        'convertFormat' => true,
        'pluginOptions' => [
            'timePicker' => false,
            'locale' => [
                'format' => 'd-m-Y',
            ],
            'ranges' => self::dateRanges(),
          //'opens'=>'left',
            'showDropdowns' => true,
          //'autoUpdateInput' => true,
            'todayHighlight' => true,
            'linkedCalendars' => false,
        ],
      //'presetDropdown'=>true,
        'hideInput' => true,
        'pluginEvents' => [
          /*"show.daterangepicker" => "function(ev,range) {
            ranges=range.element.text().trim().split(' - ')
            console.log(ranges);
            ranges[0]='05-09-2017'
            ranges[1]='05-09-2017'
            range.setStartDate(ranges[0])
            range.setEndDate(ranges[1])
            }",
          /*"hide.daterangepicker" => "function() { console.log(\"hide.daterangepicker\"); }",
          "apply.daterangepicker" => "function() { console.log(\"apply.daterangepicker\"); }",
          "cancel.daterangepicker" => "function() { console.log(\"cancel.daterangepicker\"); }",*/
        ],
    ], $option);

    if (is_string($Model)) {
      $option['value'] = $Model;
      $option['name'] = $attrName;
      //$option['useWithAddon'] = true;
    } else {
      $option['model'] = $Model;
      $option['attribute'] = $attrName;
    };

    //ddd($option);
    return DateRangePicker::widget($option);
  }

  public static function svg($name, $class = false, $alias = '@app')
  {
    $path = Yii::getAlias($alias) . '/views/svg/' . $name . '.svg';

    if (!is_readable($path)) {
      return '<pre>Фаил не найден ' . $path . '</pre>';
    }

    $output = file_get_contents($path);
    if ($class) {
      $output = str_replace('<svg', '<svg class="' . $class . '" ', $output);
    }
    return $output;
  }

  public static function href($href, $basePath = '')
  {
    $lang = isset(Yii::$app->params['lang_code']) ?
        Yii::$app->params['lang_code'] :
        Yii::$app->params['regions_list'][Yii::$app->params['region']]['langDefault'];
    $lang = $lang == Yii::$app->params['regions_list'][Yii::$app->params['region']]['langDefault'] ? '' : $lang;
    if ($lang == '') {
      return $basePath . $href;
    }
    if (substr($href, 0, 1) == '#') {
      return ($basePath != '' ? $basePath . '/' : '') . substr($href, 0, 1) . $lang . '/' . substr($href, 1);
    } else {
      return $basePath . '/' . $lang . $href;
    }
  }


  /**ищем в тектсте url, переделываем в <a hrer="...">...</a>
   * @param $text
   * @return null|string|string[]
   */
  public static function makeHrefs($text)
  {
    $pattern = '/\s((http(s)?:\/\/)|(www\.))([^\.]+)\.([^\s()]+)/i';
    return preg_replace_callback($pattern, function ($replace) {
      $href = trim($replace[0]);
      $hrefArr = explode('/', $href);
      $text = strlen($href) < 40 ? $href : $hrefArr[count($hrefArr) - 1];
      return ' <a target="_blank" rel="nofollow noreferrer"  class="blue" href="' . $href . '">' . $text . '</a> ';
    }, $text);
  }

  public function cashback($store, $params_id)
  {
    if(!$store)return "";
    $params = Yii::$app->params['cashback_render'][$params_id];
    if (is_object($store)) $store = $store->getAttributes();

    //$cashback = str_replace('до', Yii::t('main', 'up_to'), $store['displayed_cashback']);
    $cashback = $store['displayed_cashback'];
    $currency = Yii::t('main', $store['currency']);
    $cashback = str_replace(',', '.', $cashback);
    $value = preg_replace('/[^0-9\.\,]/', '', $cashback);
    $value_n = $value;
    $is_persent = strpos($cashback, '%') !== false;
    $has_up_to = strpos($cashback, 'до') !== false;
    $is_num = true;
    if (!$is_persent) {
      $value = round($value, 2);
    }
    $text = Yii::t('main', "action_description_not", ['url' => Help::href("/loyalty")]);

    if (isset($params['show_charity']) && $params['show_charity'] && $value == 0) {
      if(isset($params['replace_charity'])){
        $value = $params['replace_charity'];
      }else{
        $value = Help::svg("heart", "heart-red shop-heart-red");
      }
      $value_n = $value;
      $has_up_to = false;
      $is_num = false;
    } else {
      if ($store['action_id'] == 1) {
        $value_n = $value * 2;
        $text = "action_description_action";
        $text .= !empty($store['action_end_date']) ? '_to' : '';
        //if(isset($store['action_end_date'])){
          $text = Yii::t('main', $text, [
              'date' => date('d.m.Y', strtotime($store['action_end_date'])),
          ]);
        //}
      }
      if (!Yii::$app->user->isGuest) {
        $user = Yii::$app->user->identity;
        if ($user->loyalty_status > 0) {
          $status_data = $user->getLoyalty_status_data();
          $value_n = $value_n * (1 + $status_data['bonus'] / 100);
          $status_data['url'] = Help::href("/loyalty");
          $status_data['to'] = date('d.m.Y', $user->new_loyalty_status_end);
          if (empty($user->new_loyalty_status_end) || $user->new_loyalty_status_end < time()) {
            $text = Yii::t('main', 'action_description_loyality', $status_data);
          } elseif ($user->getIsBuyStatus()) {
            $text = Yii::t('main', 'action_description_loyality', $status_data);
          } else {
            $status_data['url'] = Help::href("/signup-bonus");
            $text = Yii::t('main', 'action_description_loyality_reg', $status_data);
          }
        }
      }
    }

    $params['only_number']=isset($params['only_number'])&&$params['only_number'];
    if ($is_num && !$params['only_number']) {
      if ($is_persent) {
        $value = number_format((float) $value, 2, '.', '&nbsp;') . "%";
        $value_n = number_format((float) $value_n, 2, '.', '&nbsp;') . "%";
      } else {
        $k = 2;//($this->round($value_n) == $this->round($value_n,2)) ? 0 : 2;
        $value = number_format($value, $k, '.', "&nbsp;") . "&nbsp;" . $currency;
        $value_n = number_format($value_n, $k, '.', "&nbsp;") . "&nbsp;" . $currency;
      }
    }

    return Yii::$app->view->render('@app/views/parts/cashback/' . $params['view'], [
        'store' => $store,
        'value' => $value,
        'value_new' => $value_n,
        'has_up_to' => $has_up_to,
        'text' => $text,
        'is_persent'=>$is_persent,
        'is_num'=>$is_num,
    ]);
    //ddd($store);
  }

}
