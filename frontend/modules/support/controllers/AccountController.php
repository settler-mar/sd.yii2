<?php

namespace frontend\modules\support\controllers;

use yii;

/**
 * Class AccountController
 * @package frontend\modules\support\controllers
 */
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
          'send' => ['post'],
        ],
      ],
    ];
  }

  /**
   * @return string
   */
  public function actionIndex()
  {
    $request = Yii::$app->request;
    if ($request->isAjax && $request->isPost) {
      $title = \Yii::$app->request->post('title');
      $message = \Yii::$app->request->post('message');
      $validator = new \yii\validators\StringValidator();
      $validatorRequired = new \yii\validators\RequiredValidator();
      if (!$validatorRequired->validate($title) || !$validatorRequired->validate($message) ||
        !$validator->validate($title) || !$validator->validate($message)
      ) {
        return json_encode(['error' => true]);
      }
      try{
        Yii::$app
          ->mailer
          ->compose(
            ['html' => 'support-html', 'text' => 'support-text'],
            [
              'title' => $title,
              'message' => $message,
              'user'=>Yii::$app->user->identity,
            ]
          )
          ->setFrom([Yii::$app->params['adminEmail'] => Yii::$app->params['adminName']])
          ->setTo(Yii::$app->params['supportEmail'])
          ->setSubject(Yii::$app->name . ': Запрос в техподдержку')
          ->send();
      } catch (\Exception $e) {
      }

      return json_encode(['error' => false]);
    }
    return $this->render('index');
  }

}
