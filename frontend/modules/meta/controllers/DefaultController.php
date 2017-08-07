<?php

namespace app\modules\meta\controllers;

use yii\web\Controller;

class DefaultController extends Controller
{
    public function actionIndex()
    {
        return $this->render('metadata');
    }
}
