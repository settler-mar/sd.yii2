<?php
namespace shop\components;

use yii\base\Widget;
use Yii;
use \yii\helpers\Url;

class LangSelect extends Widget
{
  private $showDialog = false;

  public function init()
  {
//    $dialogCloseDate  =  Yii::$app->request->cookies->getValue('_sd_country_dialog_close');
//    if (Yii::$app->user->isGuest) {
//      //неавторизован - нет значения в куки или время больше недели
//      $this->showDialog = !$dialogCloseDate || time() - $dialogCloseDate > 3600 * 24 * 7;
//    } else {
//      //авторизован - находится не в своей стране и нет куки или время куки больше недели
//      $this->showDialog = (!isset(Yii::$app->params['location']['region']) || Yii::$app->user->identity->region != Yii::$app->params['location']['region'])
//         && (!$dialogCloseDate || time() - $dialogCloseDate > 3600 * 24 * 7);
//    }
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
    $urlCurrent = Yii::$app->request->url;
    $currentRegion = Yii::$app->params['region'];
    $baseLangCode = $regionLangs[Yii::$app->params['base_lang']];
    $baseRegionCode = Yii::$app->params['regions_list']['default']['code'];

    $lang = [];
    $region = $currentRegion == 'default' ? '' : '/'.Yii::$app->params['regions_list'][$currentRegion]['code'];
    foreach ($regionLangs as $key => $value){
      $langCode = $value == $baseLangCode ? '' : '/'.$value;
      $lang[$key]=[
        'name'=>Yii::$app->params['language_list'][$key],
        'url'=>  Url::toRoute($region . $langCode. $urlCurrent, true),
        'icon'=>'/images/flag/'.$key.'.svg',
        'active' => in_array($value, $langs_active),
      ];
    }

    $regions=[];
    $langCode = $regionLangs[Yii::$app->language] == $baseLangCode ? '' : '/'.$regionLangs[Yii::$app->language];
    foreach (Yii::$app->params['regions_list'] as $k=>$v){
      $region = $v['code'] == $baseRegionCode ? '' : '/'.$v['code'];
      $regions[$k]=[
        'name'=>$v['name'],
        'url' => Url::toRoute($region . $langCode. $urlCurrent, true),
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
