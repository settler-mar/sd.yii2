<?php
//Флаги брал тут
//https://ru.wikipedia.org/wiki/%D0%A1%D0%BF%D0%B8%D1%81%D0%BE%D0%BA_%D0%B3%D0%BE%D1%81%D1%83%D0%B4%D0%B0%D1%80%D1%81%D1%82%D0%B2%D0%B5%D0%BD%D0%BD%D1%8B%D1%85_%D1%84%D0%BB%D0%B0%D0%B3%D0%BE%D0%B2#%D0%A0
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
