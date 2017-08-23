<?php

namespace frontend\modules\dobro\controllers;

use frontend\modules\charity\models\Charity;
use frontend\modules\dobro\models\Foundations;
use yii;


class AccountController extends \yii\web\Controller
{
  /**
   * @param yii\base\Action $action
   * @return bool
   * @throws yii\web\ForbiddenHttpException
   */
  public function beforeAction($action)
  {
    if (Yii::$app->user->isGuest) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }
    $this->layout = '@app/views/layouts/account.twig';
    return true;
  }

  public function actionTransfer()
  {
    $funds=Foundations::find()

      ->asArray()
      ->all();

    return $this->render('index',[
      'autopayment'=>false,//автоплатеж
      'funds'=>$funds,//фонды
    ]);
  }

  public function actionSend()
  {

    $request=Yii::$app->request;
    if(!$request->isAjax || !$request->isPost){
      return $this->redirect('/account/dobro/transfer');
    }


    $balans=Yii::$app->user->identity->balabce;
    $amount=$request->post('amount');

    if(
      !$request->post('charity-process')!= null ||
      (int)$request->post('charity-process') == 0
    ){
      return json_encode(['error' => ['Не выбран фонд.']]);
    }

    $funds=Foundations::find()
      ->where(['uid'=>$request->post('charity-process')])
      ->asArray()
      ->one();

    if(!$funds){
      return json_encode(['error' => ['Ошибка выбора фонда.']]);
    }

    if($amount>$balans['current']){
      return json_encode([
        'error' => ['Максимальная сумма для пожертвования '.number_format($balans['current'],2,'.',' ').'р.']
      ]);
    }

    if($amount<1){
      return json_encode(['error' => ['Минимальная сумма для пожертвования 1р.']]);
    }

    $charity = new Charity();
    $charity->foundation_id = $request->post('charity-process');
    $charity->amount = number_format($request->post('amount'), 2, ".", "");
    $charity->save();

    return json_encode(['error' => false]);
  }
}
