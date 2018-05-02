<?php
namespace frontend\components;

use yii\base\Widget;
use Yii;

class LangSelect extends Widget
{
  public function init()
  {
    //$this->viewPath='@frontend/view/components';
    parent::init();
  }

  public function getViewPath()
  {
    return \Yii::getAlias('@frontend/views/components');
  }

  public function run()
  {
    $lang=array_flip(Yii::$app->params['regions_list'][Yii::$app->params['region']]['langList']);
    $this_reg=Yii::$app->params['regions_list'][Yii::$app->params['region']];
    $path=Yii::$app->request->pathInfo;

    //if($this_reg['langDefault']==$lang[Yii::$app->language]){}
    foreach ($lang as $k=>$v){
      $lang[$k]=[
        'name'=>Yii::$app->params['language_list'][$k],
        'url'=>'/'.(($this_reg['langDefault']==$v)?$path:$v.'/'.$path),
        'icon'=>'/images/flag/'.$k.'.svg'
      ];
    }

    $regions=array();
    foreach (Yii::$app->params['regions_list'] as $k=>$v){
      $regions[$k]=[
        'name'=>$v['name'],
        'url'=>(isset($v['protocol'])?$v['protocol']:'https').'://'.(isset($v['url'])?$v['url']:$k).'/'.$path
      ];
    }

    $data=[
      'active'=>[
        'region'=>Yii::$app->params['region'],
        'lang'=>Yii::$app->language
      ],
      'langs'=>$lang,
      'regions'=>$regions,
    ];

    //ddd($path);
    //ddd($data);
    return $this->render('LangSelect',$data);
  }
}
