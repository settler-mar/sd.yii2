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
      $regionLangs=array_flip(Yii::$app->params['regions_list'][Yii::$app->params['region']]['langList']);
      $langs_active = Yii::$app->params['regions_list'][Yii::$app->params['region']]['langListActive'];
      $urlCurrent = Yii::$app->request->url;
      $currentRegion = Yii::$app->params['region'];
      $baseLangCode = $regionLangs[Yii::$app->params['base_lang']];

      $lang = [];
      $region =  $currentRegion;
      foreach ($regionLangs as $key => $value){
          $langCode = $value == $baseLangCode ? '' : '-'.$value;
          $lang[$key]=[
              'name'=>Yii::$app->params['language_list'][$key],
              'url'=> '/'. $region . $langCode. ($urlCurrent == '/' ? '': $urlCurrent),
              'icon'=>'/images/flag/'.$key.'.svg',
              'active' => in_array($value, $langs_active),
          ];
      }
      $regions=[];
      $langCode = $regionLangs[Yii::$app->language] == $baseLangCode ? '' : '-'.$regionLangs[Yii::$app->language];
      foreach (Yii::$app->params['regions_list'] as $key =>$value){
          $region =  $key;
          $lng = $langCode;
          if (count($value['langListActive']) == 1 || !in_array($regionLangs[Yii::$app->language], $value['langListActive'])) {
              $lng = '';
          }
          $regions[$key]=[
              'name'=>$value['name'],
              'url' => '/'. $region . $lng. ($urlCurrent == '/' ? '': $urlCurrent),
              'active' => $value['active'],
              'code' => $region == '' ? false : $region,
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
