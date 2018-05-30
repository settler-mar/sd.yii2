<?php
namespace frontend\controllers;

use frontend\models\Task;
use frontend\modules\meta\models\Meta;
use frontend\modules\stores\models\CpaLink;
use Yii;
use frontend\components\SdController;


/**
 * Site controller
 */
class AccountController extends SdController
{
  public function beforeAction($action)
  {
    if (Yii::$app->user->isGuest) {
      throw new \yii\web\ForbiddenHttpException(Yii::t('common', 'page_is_forbidden'));
      return false;
    }
    $this->view->layout_mode = 'account';
    return true;
  }

  public function actionOffline()
  {
    return $this->render('static_page', []);
  }
}
