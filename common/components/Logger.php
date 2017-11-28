<?php

namespace common\components;

use frontend\modules\users\models\Users;
use yii;
use yii\base\Component;

/**
 * Class Conversion
 * @package common\components
 */
class Logger extends Component{

  public $handle;

  function __construct()
  {
    $path=ROOT.'/log/'.date('Y/m');
    if(!is_readable($path)){
      mkdir($path,0777,true);
    }
    $path.=date('/d').'_logger.txt';

    $this->handle = fopen($path, 'a');
  }

  public function add($data){
    $text=date('H:i:s ');
    if(is_array($data) || is_object($data)){
      $data=json_encode($data);
    }
    $text.=$data."\n";

    fwrite($this->handle, $text);
    //file_put_contents($path, $text);
  }
}