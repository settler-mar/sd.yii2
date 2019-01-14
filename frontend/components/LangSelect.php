<?php
namespace frontend\components;

use yii\base\Widget;
use Yii;
use \yii\helpers\Url;


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
//    $regionLangs=array_flip(Yii::$app->params['regions_list'][Yii::$app->params['region']]['langList']);
//    $langs_active = Yii::$app->params['regions_list'][Yii::$app->params['region']]['langListActive'];
//    $this_reg=Yii::$app->params['regions_list'][Yii::$app->params['region']];
//    $path=Yii::$app->request->pathInfo;
//
//    $lang = [];
//    foreach ($regionLangs as $k=>$v){
//      if (empty(Yii::$app->params['language_list_active'][$k])) {
//        continue;
//      }
//      $lang[$k]=[
//        'name'=>Yii::$app->params['language_list'][$k],
//        'url'=>'/'.(($this_reg['langDefault']==$v)?$path:$v.'/'.$path),
//        'icon'=>'/images/flag/'.$k.'.svg',
//        'active' => in_array($v, $langs_active),
//      ];
//    }
//
//    $regions=array();
//    foreach (Yii::$app->params['regions_list'] as $k=>$v){
//      $regions[$k]=[
//        'name'=>$v['name'],
//        'url'=>(isset($v['protocol'])?$v['protocol']:'https').'://'.(isset($v['url'])?$v['url']:$k).'/'.$path,
//        'active' => $v['active'],
//        'code' => isset($v['code'])?$v['code']:false,
//      ];
//    }

      $regionLangs=array_flip(Yii::$app->params['regions_list'][Yii::$app->params['region']]['langList']);
      $langs_active = Yii::$app->params['regions_list'][Yii::$app->params['region']]['langListActive'];
      $urlCurrent = Yii::$app->request->url;
      $currentRegion = Yii::$app->params['region'];
      $baseLangCode = $regionLangs[Yii::$app->params['base_lang']];

      $lang = [];
      $codeArr = explode('.', $currentRegion);
      $region =  isset(Yii::$app->params['regions_list'][$currentRegion]['code']) ?
          '/'.Yii::$app->params['regions_list'][$currentRegion]['code']:
          '/'. $codeArr[0];
      foreach ($regionLangs as $key => $value){
          $langCode = $value == $baseLangCode ? '' : '/'.$value;
          $lang[$key]=[
              'name'=>Yii::$app->params['language_list'][$key],
              'url'=>  $region . $langCode. ($urlCurrent == '/' ? '': $urlCurrent),
              'icon'=>'/images/flag/'.$key.'.svg',
              'active' => in_array($value, $langs_active),
          ];
      }
      $regions=[];
      $langCode = $regionLangs[Yii::$app->language] == $baseLangCode ? '' : '/'.$regionLangs[Yii::$app->language];
      foreach (Yii::$app->params['regions_list'] as $k=>$v){
          $codeArr = explode('.', $k);
          $region =  isset($v['code']) ? '/'.$v['code']: '/'. $codeArr[0];
          $lng = $langCode;
          if (count($v['langListActive']) == 1 || !in_array($regionLangs[Yii::$app->language], $v['langListActive'])) {
              $lng = '';
          }
          $regions[$k]=[
              'name'=>$v['name'],
              'url' => $region . $lng. ($urlCurrent == '/' ? '': $urlCurrent),
              'active' => $v['active'],
              'code' => $region == '' ? false : substr($region, 1),
          ];
      }
     // ddd($regions, $lang);

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
