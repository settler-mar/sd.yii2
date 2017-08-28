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
      $out.=$icon_list[$status].' ';
    }
    $out.=$status_list[$status];
    $out.='</span>';
    return $out;
  }
}
