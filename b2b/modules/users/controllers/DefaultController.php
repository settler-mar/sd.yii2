<?php

namespace b2b\modules\users\controllers;

use Yii;
use yii\web\Controller;
use b2b\modules\users\models\LoginForm;

class DefaultController extends Controller
{
//    public function actionIndex()
//    {
//        return 'index';
//        return $this->render('index');
//    }
    /**
     * Login action.
     *
     * @return string
     */
    public function actionLogin()
    {
        if (!Yii::$app->user->isGuest) {
            return $this->goHome();
        }
        $model = new LoginForm();
        if ($model->load(Yii::$app->request->post()) && $model->login()) {
            return $this->goBack();
        }
        return $this->render('login', [
          'model' => $model,
        ]);
    }
    /**
     * Logout action.
     *
     * @return string
     */
    public function actionLogout()
    {
        Yii::$app->user->logout();
        return $this->goHome();
    }
}
