<?php

namespace frontend\modules\stores\controllers;

//use yii\web\Controller;
//use frontend\components\SdController;
use yii;
use frontend\components\SdController;
use frontend\modules\stores\models\Stores;
use frontend\modules\stores\models\PromoStores;
use frontend\modules\category_stores\models\CategoryStores;

class DefaultController extends SdController
{
    public function actionIndex()
    {
        $request = Yii::$app->request;
        $validator = new \yii\validators\NumberValidator();
        $validatorIn = new \yii\validators\RangeValidator(['range' => ['visit', 'name', 'added',
            'cashback_percent', 'cashback_summ']]);


        if (!empty($request->get('limit')) && !$validator->validate($request->get('limit')) ||
           !empty($request->get('page')) && !$validator->validate($request->get('page')) ||
           !empty($request->get('category')) && !$validator->validate($request->get('category')) ||
           !empty($request->get('sort')) && !$validatorIn->validate($request->get('sort'))
        ) {
            throw new \yii\web\NotFoundHttpException;
        };
        $stores = new Stores();
        $storesData = $stores->getStores();
        $storesData['promo_stores'] = PromoStores::getPromoStores();

        return $this->render('catalog', $storesData);
    }
}

