<?php

namespace frontend\modules\coupons\controllers;

use yii\web\Controller;
use frontend\modules\coupons\models\Coupons;
use frontend\modules\coupons\models\CategoriesCoupons;
use frontend\modules\stores\models\Stores;

class DefaultController extends Controller
{
    public function actionIndex()
    {
        return $this->render('index');
    }
}
