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
    $funds=Foundations::translated()
      ->asArray()
      ->all();

    $auto=Autopayments::find()
      ->where(['user_id'=>Yii::$app->user->id])
      //->asArray()
      ->one();

    return $this->render('index',[
      'autopayment'=>$auto,//автоплатеж
      'funds'=>$funds,//фонды
      'model' => new Charity(),
    ]);
  }

  public function actionSend(){
    $request=Yii::$app->request;
    if(!$request->isAjax || !$request->isPost){
      return $this->redirect('/account/dobro/transfer');
    }

    $charity = new Charity();
    $charity->scenario = Charity::SCENARIO_ACCOUNT;
    if ($charity->load($request->post()) && $charity->save()) {
        Yii::$app->balanceCalc->todo([$charity->user_id], 'foundation');
    } else {
        $data['html'] = $this->renderAjax('form.twig', ['model' => $charity]);
        return json_encode($data);
    }

    return json_encode(['error' => false, 'message' => Yii::t('account', 'charity_is_sent')]);
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

    return json_encode(['error' => false,'message' => Yii::t('account', 'autopayment_is_set')]);
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
    return json_encode(['error' => false,'message' => Yii::t('account', 'autopayment_is_unset')]);
  }
}
