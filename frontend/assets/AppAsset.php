<?php

namespace frontend\assets;

use yii\web\AssetBundle;
use Yii;
use yii\helpers\Url;

/**
 * Main frontend application asset bundle.
 */
class AppAsset extends AssetBundle
{
  public $basePath = '@webroot';
  public $baseUrl = '@web';
  public $max_v = 0;
  public $css = [
  ];
  public $js = [
  ];
  public $depends = [
    'yii\web\YiiAsset',
    //'yii\bootstrap\BootstrapPluginAsset',
    //'yii\bootstrap\BootstrapAsset',
  ];

  public function init()
  {
    parent::init();

    $url = Url::current();
    $script_version = YII_DEBUG?'':'.min';
    $path_scripts = Yii::$app->params['pathToScript'];

    $file_list = array();

    $path = trim($url, '/');
    $dir = str_replace('-','/', $path);
    $dir = explode('/', $dir);
    $dir = explode('?', $dir[0]);
    $dir = $dir[0];
    if (isset($path_scripts[$dir])) {
      $path_script = $path_scripts[$dir];
    } else {
      $path_script = $path_scripts['default'];
    }
    if ($dir=='admin') {
        $this->depends[] = 'mihaildev\elfinder\Assets';
        $this->depends[] = 'mihaildev\ckeditor\Assets';
    }

    $bp=Yii::$app->getBasePath().'/web/';
    //прописываем js
    if (isset($path_script['js'])) {
      foreach ($path_script['js'] as $js) {
        $js = str_replace('{{script_version}}', $script_version, $js);
        $js = str_replace('..', '.', $js);
        $v=$this->getV($bp.$js);
        $file_list[]=$js;
        $this->js[] = $js.$v;
      }
    }

    //прописываем стили
    if (isset($path_script['css'])) {
      foreach ($path_script['css'] as $css) {
        $css = str_replace('{{script_version}}', $script_version, $css);
        $css = str_replace('..', '.', $css);
        $v=$this->getV($bp.$css);
        $file_list[]=$css;
        $this->css[] = $css.$v;
      }
    }

    //if($this->max_v>$this->getV($bp.'manifest.appcache',true)){
      $fp = fopen($bp.'manifest.appcache', "w"); // Открываем файл в режиме записи
      $mytext = "CACHE MANIFEST\r\n".
          "# ".date('d-m-Y',$this->max_v)." v".date('y.m.d',$this->max_v)."\r\n";
      $mytext .= implode("\r\n",$file_list)."\r\n";
      $mytext .= "\r\n".
         "NETWORK:\r\n".
          "*\r\n\r\n".
          "FALLBACK:\r\n";
      fwrite($fp, $mytext); // Запись в файл
      fclose($fp); //Закрытие файла
    //}
  }

  private function getV($filename,$only_date = false){
    $filename=str_replace('//','/',$filename);
    if (!file_exists($filename)) {
      return $only_date?0:'';
    }
    $v=filemtime($filename);

    if($only_date){
      return $v;
    };

    if($this->max_v<$v)$this->max_v=$v;
    return '?v='.$v;
  }
}
