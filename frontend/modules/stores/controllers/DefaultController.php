<?php

namespace frontend\modules\stores\controllers;

//use yii\web\Controller;
//use frontend\controllers\SdController;
use Yii;
use frontend\components\SdController;

class DefaultController extends SdController
{
    public function actionIndex()
    {
      d(Yii::$app->request->get());

        return $this->render('catalog');
    }
}

