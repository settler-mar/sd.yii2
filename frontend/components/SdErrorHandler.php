<?php

namespace frontend\components;

use yii\web\ErrorAction;
use frontend\models\DeletedPages;
use yii;

/**
 * Class SdErrorHandler
 * @package frontend\components
 */
class SdErrorHandler extends ErrorAction
{
  /**
   * @return string
   */
  public function run(){
    if ($this->getExceptionCode()==404) {
      //Делаем проверку на удалённую страницу
      $this->checkDeletedPage();
      Yii::$app->params['global_bg']='gray-box';
      Yii::$app->params['global_wrap']='page-404';
    }
    return parent::run();
  }

  /**
   * @param $request
   * проверяем на удалённую страницу
   */
  protected function checkDeletedPage()
  {
    $deletedPage = DeletedPages::findOne(['page'=> '/' . Yii::$app->request->pathinfo]);
    if ($deletedPage) {
      //count и дата ставятся автоматом в модели
      $deletedPage->save();
      //редиректим
      \Yii::$app->response->redirect($deletedPage->new_page, 301)->send();
      exit;
    }
  }
};