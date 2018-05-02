<?php

namespace frontend\modules\language\controllers;

use yii\web\Controller;
use Yii;

class AdminController extends Controller
{
  public function beforeAction($action)
  {
    if (Yii::$app->user->isGuest) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
    }
    $this->layout = '@app/views/layouts/admin.twig';
    return true;
  }

    public function actionIndex()
    {
      if (Yii::$app->user->isGuest || !Yii::$app->user->can('admin')) {
        throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
        return false;
      }

        return $this->render('index');
    }
}
