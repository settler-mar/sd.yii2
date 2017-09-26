<?php

namespace app\modules\api\controllers;

use b2b\modules\stores_points\models\B2bStoresPoints;
use frontend\modules\stores\models\Stores;
use frontend\modules\stores\models\StoresActions;
use frontend\modules\users\models\Users;
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
    if(!$request->post('regNumber')){
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

    if(!$store_id){
      $store_id=Yii::$app->session->get('store');
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
    return implode(',',$out)."\n";
  }

  public function actionSave(){
    $store_id=Yii::$app->session->get('store');

    if(!$store_id && !$this->actionLogin()){
      return 'Ошибка прав доступа';
    }

    $request=Yii::$app->request;
    if(
      !$request->post('category') ||
      !$request->post('user_code') ||
      !$request->post('sum')
    ){
      return 'Ошибка данных';
    }

    if(!$store_id){
      $store_id=Yii::$app->session->get('store');
    }

    $store = Stores::find()
      ->where(['uid'=>$store_id])
      ->one();
    $cpa = $store->getCpaLink()->one();

    $action_id=explode(':',$request->post('category'));
    $action=StoresActions::find()
      ->where([
        'uid'=>$action_id[0],
        'cpa_link_id'=>$cpa->uid
      ])
      ->one();
    if(!$action){
      return 'Категория не доступна';
    }

    $tariff=$action->getTariffs()
      ->orderBy('uid')
      ->one();
    $rates=$tariff->getRates()
      ->where('date_s<'.date("Y-m-d H:i:s"))
      ->orderBy(['date_s DESC','uid'])
      ->one();

    $user=explode('-',trim($request->post('user_code')));
    if(mb_strtolower($user[0])!='SD'){
      return 'Не верный формат идентификатора пользователя';
    }

    $user=Users::find()
      ->where(['uid'=>(int)$user[1]])
      ->one();
    if(!$user){
      return 'Пользователь не найден';
    }

    $sum=str_replace(',','.',trim($request->post('user_code')));
    if($sum!=(float)$sum || (float)$sum){
      return 'Пользователь не найден';
    }

    return 'OK';

  }
}
