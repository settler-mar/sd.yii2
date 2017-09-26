<?php

namespace app\modules\api\controllers;

use b2b\modules\stores_points\models\B2bStoresPoints;
use yii\web\Controller;
use Yii;

class DefaultController extends Controller
{
  public function beforeAction($action)
  {
    // Выключаем возможность использования межсайтовых запросов
    Yii::$app->request->enableCsrfValidation = false;

    //return some value
    return true;
  }

  public function actionLogin()
  {
    $request=Yii::$app->request;
    if(!$request->isPost || !$request->post('regNumber')){
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }

    $point=B2bStoresPoints::find()
      ->where(['access_code'=>$request->post('regNumber')])
      ->one();
    if(!$point){
      echo 'Не найдена торговая точка с этим номером.';
      http_response_code(404);
      return;
    }

    Yii::$app->session->set('point',$point->id);
    Yii::$app->session->set('store',$point->store_id);
    return true;
  }
}
