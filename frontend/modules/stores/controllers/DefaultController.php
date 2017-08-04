<?php

namespace frontend\modules\stores\controllers;

//use yii\web\Controller;
use frontend\controllers\SdController;

class DefaultController extends SdController
{
    public function actionIndex()
    {
        return $this->render('index');
    }
}
