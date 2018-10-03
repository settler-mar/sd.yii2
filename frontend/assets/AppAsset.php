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

        $this->js[] = $js.$v;
      }
    }

    //прописываем стили
    if (isset($path_script['css'])) {
      foreach ($path_script['css'] as $css) {
        $css = str_replace('{{script_version}}', $script_version, $css);
        $css = str_replace('..', '.', $css);
        $v=$this->getV($bp.$css);

        $this->css[] = $css.$v;
      }
    }
  }

  private function getV($filename){
    $filename=str_replace('//','/',$filename);
    if (!file_exists($filename)) {
      return '';
    }
    $v=filemtime($filename);

    return '?v='.$v;
  }
}
