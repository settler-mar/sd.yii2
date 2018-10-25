<?php

namespace shop\assets;

use yii\web\AssetBundle;
use Yii;

/**
 * Main b2b application asset bundle.
 */
class AppAsset extends AssetBundle
{
    public $basePath = '@webroot';
    public $baseUrl = '@web';
    public $css = [
        '/css/styles{{script_version}}.css',
    ];
    public $js = [
        '/js/scripts{{script_version}}.js'
    ];
    public $depends = [
        'yii\web\YiiAsset',
    ];
    public function init()
    {
        $script_version = Yii::$app->params['scriptVersion'];
        foreach ($this->js as &$js) {
          $js = str_replace('{{script_version}}', $script_version, $js);
          $js = str_replace('..', '.', $js);
        }
        foreach ($this->css as &$css) {
            $css = str_replace('{{script_version}}', $script_version, $css);
            $css = str_replace('..', '.', $css);
        }
    }
}
