<?php

namespace common\components;
use yii\base\Component;

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

  public function colorStatus($status, $showIcon = true, $status_list=false)
  {
    if(!$status_list) {
      $status_list = [
        'В ожидании',
        'Отклонён',
        'Подтверждён',
      ];
    };
    $icon_list = [
      '<span class="fa fa-clock-o"></span>',
      '<span class="fa fa-times"></span>',
      '<span class="fa fa-check"></span>',
    ];
    if(!isset($status_list[$status]))return '!!! ОЩИБКА !!!';
    $out='<span class="status_'.$status.'"">';

    if($showIcon && isset($icon_list[$status])){
      $out.=$icon_list[$status].'&nbsp;';
    }
    $out.=$status_list[$status];
    $out.='</span>';
    return $out;
  }
}
