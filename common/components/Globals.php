<?php

namespace common\components;

use yii;
use yii\base\Component;

/**
 * Class Conversion
 * @package common\components
 */
class Globals extends Component
{
  private $data = null;


  public function get($name){
    if(!empty($this->data[$name])){
      return $this->data[$name];
    }

    return null;
  }

  public function set($name,$data){
    $this->data[$name]=$data;
  }
}
