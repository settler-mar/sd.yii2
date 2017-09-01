<?php

namespace frontend\modules\affiliate\controllers;

use yii;
use frontend\modules\users\models\Users;

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

  /**
   * @return array
   */
  public function behaviors()
  {
    return [
      'verbs' => [
        'class' => \yii\filters\VerbFilter::className(),
        'actions' => [
          'index' => ['get'],
          'invite' => ['post'],
        ],
      ],
    ];
  }

  public function actionIndex()
  {
    $user = Users::findOne(\Yii::$app->user->id);
    $contentData["number_referrals"] = $user->ref_total;
    $contentData["pending_payments_referrals"] = $user->sum_from_ref_pending;
    $contentData["confirmed_payments_referrals"] = $user->sum_from_ref_confirmed;
    return $this->render('index', $contentData);
  }

  public function actionInvite()
  {
    $request = \Yii::$app->request;

    if (!$request->isPost || !$request->isAjax) {
      return $this->redirect('/account/affiliate');
    }

    if (strlen($request->post('email')) < 5) {
      return json_encode(['error' => ['Введите хотя бы один email адрес.']]);
    }
    $emails = explode(',', $request->post('email'));

    $validator = new \yii\validators\EmailValidator();
    $validatorRequired = new \yii\validators\RequiredValidator();

    if (count($emails) > 3) {
      return json_encode(['error' => ['За один раз можно отправлять не более 3-х приглашений.']]);
    }

    $valid_mail = [];
    foreach ($emails as $email) {
      $email = trim($email);
      if (!$validatorRequired->validate($email) || !$validator->validate($email)) {
        return json_encode(['error' => ['Один или несколько email адресов некоректны']]);
      }

      if (!in_array($email, $valid_mail)) {
        $valid_mail[] = $email;
      }
    }

    $user = Yii::$app->user->identity;
    foreach ($valid_mail as $email) {
      Yii::$app
        ->mailer
        ->compose(
          ['html' => 'invitation-html', 'text' => 'invitation-text'],
          [
            'user' => $user,
            'appName' => Yii::$app->name,
            'reflink' => 'https://secretdiscounter.ru/?r='.$user->uid,
            'link' => 'https://secretdiscounter.ru/',
          ]
        )
        ->setFrom([Yii::$app->params['supportEmail'] => Yii::$app->params['supportEmail']])
        ->setTo($email)
        ->setReplyTo($user->email)
        ->setSubject('Вас приглашают на ' . Yii::$app->name)
        ->send();
    }

    //todo отправка сообщения
    return json_encode(['error' => false]);
  }

}
