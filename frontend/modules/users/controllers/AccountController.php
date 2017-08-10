<?php

namespace frontend\modules\users\controllers;

use Yii;
use frontend\modules\users\models\Users;
use frontend\modules\users\models\UsersSearch;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;

/**
 * AdminController implements the CRUD actions for Users model.
 */
class AccountController extends Controller
{

  function beforeAction($action) {
    if (Yii::$app->user->isGuest) {
     // throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      //return false;
    }

    $this->layout='@app/views/layouts/account.twig';
    return true;
  }


  /**
     * Lists all Users models.
     * @return mixed
     */
    public function actionIndex()
    {
        return $this->render('index.twig');
    }

}
