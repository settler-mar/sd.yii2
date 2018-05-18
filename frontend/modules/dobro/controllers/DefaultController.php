<?php

namespace frontend\modules\dobro\controllers;

use yii\web\Controller;
use frontend\components\SdController;
use frontend\modules\funds\models\Foundations;

/**
 * Class DefaultController
 * @package frontend\modules\dobro\controllers
 */
class DefaultController extends SdController
{
    /**
     * @return string
     */
    public function actionIndex()
    {

        $contentData['funds'] = Foundations::find()
            ->where(["is_active" => 1])
            ->orderBy("uid ASC")
            ->asArray()
            ->all();

        $this->params['breadcrumbs'][] = \Yii::t('main', 'dobro_do_breadcrumbs');

        return $this->render('index', $contentData);
    }
}
