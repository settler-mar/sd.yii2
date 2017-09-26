<?php

namespace app\modules\api\controllers;

use b2b\modules\stores_points\models\B2bStoresPoints;
use frontend\modules\stores\models\Stores;
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
      http_response_code(403);
      return false;
    }

    $point=B2bStoresPoints::find()
      ->where(['access_code'=>$request->post('regNumber')])
      ->one();
    if(!$point){
      http_response_code(200);
      return 'Не найдена торговая точка с этим номером.';
    }

    Yii::$app->session->set('point',$point->id);
    Yii::$app->session->set('store',$point->store_id);
    return 'OK';
  }

  public function actionCategories()
  {
    $store_id=Yii::$app->session->get('store');

    if(!$store_id && !$this->actionLogin()){
      return 'Ошибка прав доступа';
    }

    $store = Stores::find()
      ->where(['uid'=>$store_id])
      ->one();


    $cpa = $store->getCpaLink()->one();

    $cat_ist=$cpa->getStoreActions()->asArray()->all();
    $out=array();
    foreach ($cat_ist as $item){
      $out[]= '"'.$item['uid'].': '.str_replace('"',"\\\"",$item['name']).'"';
    }
    return implode(',',$out);
  }
}
