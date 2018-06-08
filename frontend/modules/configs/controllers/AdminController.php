<?php

namespace frontend\modules\configs\controllers;

use yii;
use frontend\modules\configs\models\Config;

/**
 * Class AdminController
 * @package frontend\modules\cache\controllers
 */
class AdminController extends \yii\web\Controller
{

    /**
     * @param yii\base\Action $action
     * @return bool
     * @throws yii\web\ForbiddenHttpException
     */
    public function beforeAction($action)
    {
        if (!Yii::$app->user->identity->is_admin) {
            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
        }
        $this->layout = '@app/views/layouts/admin.twig';
        return true;
    }

    public function actionIndex()
    {
        $model = new Config();
        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            Yii::$app->session->addFlash('success', 'Конфигурация сохранена');
        }
        return $this->render('update.twig', [
            'model' => $model,
        ]);
    }

}
