<?php

namespace common\components;
use kartik\daterange\DateRangePicker;
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
  private function rus2translit($string)
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
  public function str2url($str)
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
      'Сегодня' => ["moment().startOf('day')", "moment()"],
      'Вчера' => ["moment().startOf('day').subtract(1,'days')", "moment().endOf('day').subtract(1,'days')"],
      'Текущая неделя' => ["moment().startOf('weak')", "moment()"],
      'Последние 7 дней' => ["moment().startOf('day').subtract(6, 'days')", "moment()"],
      'Последние 30 дней' => ["moment().startOf('day').subtract(29, 'days')", "moment()"],
      'Этот месяц' => ["moment().startOf('month')", "moment()"],
      'Последний месяц' => ["moment().subtract(1, 'month').startOf('month')", "moment().subtract(1, 'month').endOf('month')"],
      'Этот год' => ["moment().startOf('year')", "moment()"],
      'Прошлый год' => ["moment().subtract(1, 'year').startOf('year')", "moment().subtract(1, 'year').endOf('year')"],
    ];
  }

  public static function DateRangePicker($Model,$attrName,$option=array()){
    $option=ArrayHelper::merge([
      'convertFormat'=>true,
      'pluginOptions' => [
        'timePicker'=>false,
        'locale'=>[
          'format'=>'d-m-Y',
        ],
        'ranges'=>self::dateRanges(),
        //'opens'=>'left',
        'showDropdowns'=>true,
        //'autoUpdateInput' => true,
        'todayHighlight' => true,
      ],
      //'presetDropdown'=>true,
      'hideInput'=>true,
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
    ],$option);

    if(is_string($Model)){
      $option['value'] = $Model;
      $option['name'] = $attrName;
      //$option['useWithAddon'] = true;
    }else{
      $option['model'] = $Model;
      $option['attribute'] = $attrName;
    };

    //ddd($option);
    return DateRangePicker::widget($option);
  }
}
