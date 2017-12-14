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
  public $handle_users=[];

  function __construct()
  {
    $path=ROOT.'/log/'.date('Y/m');
    if(!is_readable($path)){
      mkdir($path,0777,true);
    }
    $path.=date('/d').'_logger.txt';

    $this->handle = fopen($path, 'a');
  }

  public function add($data,$file=false,$date=true){
    $text=date('H:i:s ');
    if(is_array($data) || is_object($data)){
      $data=json_encode($data);
    }
    $text.=$data."\n";

    if(!$file) {
      fwrite($this->handle, $text);
    }else{
      if($date){
        $file=date('Y_m_d_').$file;
      }

      if(!isset($this->handle_users[$file])) {
        $path = ROOT . '/log/useres';
        if (!is_readable($path)) {
          mkdir($path, 0777, true);
        }
        $path .= '/' . $file . '.txt';
        $this->handle_users[$file] = fopen($path, 'a');
      }
      fwrite($this->handle_users[$file], $text);
    }
  }
}