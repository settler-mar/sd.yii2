<?php

namespace frontend\modules\support\controllers;

use yii;
use frontend\modules\support\models\Support;
use common\components\Help;

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
      throw new \yii\web\ForbiddenHttpException(Yii::t( 'common', 'page_is_forbidden'));
      return false;
    }
    $this->view->layout_mode='account';
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
    $model = new Support();
    if ($request->isAjax && $request->isPost) {

       if ($model ->load($request->post()) && $model->validate()) {
          try{
             Yii::$app
                ->mailer
                ->compose(
                    ['html' => 'support-html', 'text' => 'support-text'],
                    [
                        'message' => [
                            'title' => $model->title,
                            'text' => $model->message,
                        ],
                        'user'=>Yii::$app->user->identity,
                    ]
                )
                ->setFrom([Yii::$app->params['adminEmail'] => Yii::$app->params['adminName']])
                ->setTo(Yii::$app->params['supportEmail'])
                ->setSubject(Yii::$app->name . ': '. Yii::t('account', 'support_subject'))
                ->send();
             return json_encode(['error' => false, 'message'=> Yii::t('account', 'message_to_admin_successfully_sent')]);
          } catch (\Exception $e) {
             return json_encode(['error' => True,'title'=>Yii::t('account', 'error_sending_message'),'message'=> Yii::t('account', 'service_temporaty_unavailable')]);
          }
       }
    }
    return $this->render('index', [
        'reCaptcha' => \himiklab\yii2\recaptcha\ReCaptcha::className(),
        'model' => $model,
        'action' => Help::href('/account/support'),

    ]);
  }

}
