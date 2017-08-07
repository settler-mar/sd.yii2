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
      'yii\bootstrap\BootstrapPluginAsset',
      'yii\bootstrap\BootstrapAsset',
  ];

  public function init()
  {
    parent::init();

    $url=Url::current();
    $script_version=Yii::$app->params['scriptVersion'];
    $path_scripts=Yii::$app->params['pathToScript'];

    $path=trim($url,'/');
    $dir=explode('/',$path);
    $dir=$dir[0];
    if(isset($path_scripts[$dir])){
      $path_script=$path_scripts[$dir];
    }else{
      $path_script=$path_scripts['default'];
    }
    
    Yii::$app->layout = $path_script['layout'];

    //прописываем js
    if(isset($path_script['js'])){
      foreach ($path_script['js'] as $js ){
        $js=str_replace('{{script_version}}',$script_version,$js);
        $this->js[]=$js;
      }
    }

    //прописываем стили
    if(isset($path_script['css'])){
      foreach ($path_script['css'] as $css ){
        $css=str_replace('{{script_version}}',$script_version,$css);
        $this->css[]=$css;
      }
    }

  }
}
