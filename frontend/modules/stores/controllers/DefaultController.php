<?php

namespace frontend\modules\stores\controllers;

//use yii\web\Controller;
//use frontend\components\SdController;
use Yii;
use frontend\components\SdController;
use frontend\modules\stores\models\Stores;
use frontend\modules\stores\models\PromoStores;
use frontend\modules\category_stores\models\CategoryStores;

class DefaultController extends SdController
{
    public function actionIndex()
    {
        $stores = new Stores();
        $storesData = $stores->getStores();
        $storesData['promo_stores'] = PromoStores::getPromoStores();

        return $this->render('catalog', $storesData);
    }
}

