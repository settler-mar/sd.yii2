<?php

namespace api\controllers;

use frontend\modules\users\models\Users;
use yii;
use yii\web\Controller;


class UserController extends Controller
{

  public function beforeAction($action)
  {
    if ($action->id == 'login') {
      $this->enableCsrfValidation = false;
    }

    return parent::beforeAction($action);
  }

  public function actionLogin()
  {
    $request = Yii::$app->request;

    if ($request->isGet) {
      Yii::$app->session->set('temp_key', md5(time()));
      return Yii::$app->session->get('temp_key');
    }

    if (
        empty($request->post('user')) ||
        empty($request->post('password')) ||
        empty($request->post('key')) ||
        !$this->validate($request)
    ) {
      throw new \yii\web\NotFoundHttpException("not valid.");
      return;
    }

    $user = Users::findOne(['email' => $request->post('user')]);
    if ($user && $user->is_active == Users::STATUS_DELETED) {
      return 2;
    }

    if (!$user || !$user->validatePassword($this->password)) {
      return 0;
    }

    return (Yii::$app->user->login($user) ? 3 : 1);
  }

  public function actionData(){
    if(Yii::$app->user->isGuest){
      throw new \yii\web\NotFoundHttpException("not found.");
      return;
    }

    Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;
    $data = Yii::$app->user->identity->getAttributes([
        'name',
        'email',
        'birthday',
        'sex',
        'photo',
        'added',
        'loyalty_status',
        'ref_total',
        'sum_pending',
        'cnt_pending',
        'sum_confirmed',
        'cnt_confirmed',
        'sum_from_ref_pending',
        'sum_from_ref_confirmed',
        'sum_to_friend_pending',
        'sum_to_friend_confirmed',
        'sum_foundation',
        'sum_withdraw',
        'sum_bonus',
        'cnt_declined',
        'sum_declined',
        'old_loyalty_status',
        'new_loyalty_status_end',
        'region',
        'language',
        'currency',
        'notice_email_status',
    ]);

    return $data;
  }

  public function validate($request)
  {
    $data = $request->post('user') . Yii::$app->params['appKey'] . $request->post('password') . Yii::$app->session->get('temp_key');
    return md5($data) == $request->post('key');
  }
}