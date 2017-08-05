<?php

namespace frontend\modules\stores\controllers;

//use yii\web\Controller;
use frontend\controllers\SdController;
use Yii;

class DefaultController extends SdController
{
    public function actionIndex()
    {
      d(Yii::$app->request->get());
      ddd(\Yii::$app->request->get());
        return $this->render('index');
    }
}

