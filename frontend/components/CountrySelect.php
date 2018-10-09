<?php
namespace frontend\components;

use yii\base\Widget;
use Yii;
use common\models\GeoIpCountry;
use frontend\modules\country\models\CountryToLanguage;

class CountrySelect extends Widget
{
  protected $countries;
  protected $countryList;
  protected $showDialog = 0;

  public function init()
  {
    $countries  = CountryToLanguage::find()->select(['country'])->asArray()->all();
    $countryList = GeoIpCountry::countryList();
    foreach ($countries as $country) {
      $this->countries[$country['country']] = isset($countryList[$country['country']]) ? $countryList[$country['country']] : '';
    }

    $dialogCloseDate  = isset($_COOKIE['_sd_country_dialog_close']) ? $_COOKIE['_sd_country_dialog_close'] : false;
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
    //включить в настройках
    if (!Yii::$app->params['country_select_active']) {
      return '';
    }
    $data['countries'] = $this->countries;
    $data['show_dialog'] = $this->showDialog;
    return $this->render('CountrySelect', $data);
  }
}
