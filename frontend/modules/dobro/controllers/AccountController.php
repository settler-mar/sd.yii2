<?php

namespace frontend\modules\dobro\controllers;

use frontend\modules\charity\models\Charity;
use frontend\modules\dobro\models\Autopayments;
use frontend\modules\funds\models\Foundations;
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
      throw new \yii\web\ForbiddenHttpException(Yii::t('common', 'page_is_forbidden'));
      return false;
    }
    $this->view->layout_mode='account';
    return true;
  }

  public function actionTransfer()
  {
    $funds=Foundations::find()

      ->asArray()
      ->all();

    $auto=Autopayments::find()
      ->where(['user_id'=>Yii::$app->user->id])
      //->asArray()
      ->one();

    return $this->render('index',[
      'autopayment'=>$auto,//автоплатеж
      'funds'=>$funds,//фонды
    ]);
  }

  public function actionSend(){
    $request=Yii::$app->request;
    if(!$request->isAjax || !$request->isPost){
      return $this->redirect('/account/dobro/transfer');
    }

    $balans=Yii::$app->user->identity->balance;
    $amount=$request->post('amount');

    if(
      !$request->post('charity-process')!= null ||
      (int)$request->post('charity-process') == 0
    ){
      return json_encode(['error' => [Yii::t('account', 'dobro_found_not_choosen')]]);
    }

    $funds=Foundations::find()
      ->where(['uid'=>$request->post('charity-process')])
      ->asArray()
      ->one();

    if(!$funds){
      return json_encode(['error' => [Yii::t('account', 'dobro_found_choose_error')]]);
    }

    if($amount>$balans['max_fundation']){
      return json_encode([
        'error' => [Yii::t('account','dobro_max_summ').' '.number_format($balans['max_fundation'],2,'.',' ').'р.']
      ]);
    }
//    if($amount>$balans['current']){
//      return json_encode([
//        'error' => ['Максимальная сумма для пожертвования '.number_format($balans['current'],2,'.',' ').'р.']
//      ]);
//    }

    if($amount<1){
      return json_encode(['error' => [Yii::t('account','dobro_max_summ')]]);
    }

    $charity = new Charity();
    $charity->foundation_id = $request->post('charity-process');
    $charity->amount = number_format($request->post('amount'), 2, ".", "");
    $charity->save();

    Yii::$app->balanceCalc->todo([$charity->user_id], 'foundation');

    return json_encode(['error' => false, 'message' => 'Пожертвование успешно отправлено']);
  }

  public function actionAutoSend()
  {

    $request=Yii::$app->request;
    if(!$request->isAjax || !$request->isPost){
      return $this->redirect('/account/dobro/transfer');
    }

    if(
      !$request->post('autopayment-uid')!= null ||
      (int)$request->post('autopayment-uid') == 0
    ){
      return json_encode(['error' => [Yii::t('account', 'dobro_found_not_choosen')]]);
    }

    $funds=Foundations::find()
      ->where(['uid'=>$request->post('autopayment-uid')])
      ->asArray()
      ->one();

    if(!$funds){
      return json_encode(['error' => [Yii::t('account', 'dobro_found_choose_error')]]);
    }

    $auto=Autopayments::find()
      ->where(['user_id'=>Yii::$app->user->id])
      //->asArray()
      ->one();

    if($auto){
      return json_encode(['error' => [Yii::t('account', 'dobro_auto_payment_choosen_already')]]);
    }

    $auto=new Autopayments();
    $auto->foundation_id=$request->post('autopayment-uid');
    $auto->save();

    return json_encode(['error' => false]);
  }


  public function actionAutoDelete()
  {

    $request=Yii::$app->request;
    if(!$request->isAjax || !$request->isPost){
      return $this->redirect('/account/dobro/transfer');
    }

    $auto=Autopayments::find()
      ->where(['user_id'=>Yii::$app->user->id])
      //->asArray()
      ->one();

    if(!$auto){
      return json_encode(['error' => [Yii::t('account', 'dobro_not_payment_default')]]);
    }

    $auto->delete();
    return json_encode(['error' => false]);
  }
}
