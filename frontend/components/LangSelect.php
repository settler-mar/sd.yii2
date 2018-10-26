<?php
namespace frontend\components;

use yii\base\Widget;
use Yii;

class LangSelect extends Widget
{
  private $showDialog;

  public function init()
  {
    $dialogCloseDate  =  Yii::$app->request->cookies->getValue('_sd_country_dialog_close');
    if (Yii::$app->user->isGuest) {
      //неавторизован - нет значения в куки или время больше недели
      $this->showDialog = !$dialogCloseDate || time() - $dialogCloseDate > 3600 * 24 * 7;
    } else {
      //авторизован - находится не в своей стране и нет куки или время куки больше недели
      $this->showDialog = (!isset(Yii::$app->params['location']['region']) || Yii::$app->user->identity->region != Yii::$app->params['location']['region'])
         && (!$dialogCloseDate || time() - $dialogCloseDate > 3600 * 24 * 7);
    }
    parent::init();
  }

  public function getViewPath()
  {
    return \Yii::getAlias('@frontend/views/components');
  }

  public function run()
  {
    $regionLangs=array_flip(Yii::$app->params['regions_list'][Yii::$app->params['region']]['langList']);
    $langs_active = Yii::$app->params['regions_list'][Yii::$app->params['region']]['langListActive'];
    $this_reg=Yii::$app->params['regions_list'][Yii::$app->params['region']];
    $path=Yii::$app->request->pathInfo;

    $lang = [];
    foreach ($regionLangs as $k=>$v){
      if (empty(Yii::$app->params['language_list_active'][$k])) {
        continue;
      }
      $lang[$k]=[
        'name'=>Yii::$app->params['language_list'][$k],
        'url'=>'/'.(($this_reg['langDefault']==$v)?$path:$v.'/'.$path),
        'icon'=>'/images/flag/'.$k.'.svg',
        'active' => in_array($v, $langs_active),
      ];
    }

    $regions=array();
    foreach (Yii::$app->params['regions_list'] as $k=>$v){
      $regions[$k]=[
        'name'=>$v['name'],
        'url'=>(isset($v['protocol'])?$v['protocol']:'https').'://'.(isset($v['url'])?$v['url']:$k).'/'.$path,
        'active' => $v['active'],
        'code' => isset($v['code'])?$v['code']:false,
      ];
    }

    $data=[
      'active'=>[
        'region'=>Yii::$app->params['region'],
        'lang'=>Yii::$app->language
      ],
      'langs' => $lang,
      'regions' => $regions,
      'langlist' => json_encode(Yii::$app->params['regions_list'][Yii::$app->params['region']]['langList']),
      'show_dialog_panel' => $this->showDialog,
    ];
    return $this->render('LangSelect',$data);
  }
}
