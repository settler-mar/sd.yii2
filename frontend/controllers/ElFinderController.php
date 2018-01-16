<?php

namespace frontend\controllers;
use Yii;
use yii\web\Controller;
use zxbodya\yii2\elfinder\ConnectorAction;
use zxbodya\yii2\tinymce\TinyMceCompressorAction;

class ElFinderController extends Controller
{
  public function actions()
  {

    if(Yii::$app->user->isGuest || Yii::$app->user->can('FilesEdit'))
    return [
        'connector' => array(
            'class' => ConnectorAction::className(),
            'settings' => array(
                'root' => Yii::getAlias('@webroot') . '/img/',
                'URL' => Yii::getAlias('@web') . '/img/',
                'rootAlias' => 'Home',
                'mimeDetect' => 'none'
            )
        ),
        'compressor' => [
            'class' => TinyMceCompressorAction::className(),
        ],
    ];
  }
}