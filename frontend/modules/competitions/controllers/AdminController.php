<?php

namespace frontend\modules\competitions\controllers;

use yii;
use frontend\modules\competitions\models\Competitions;

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
        $model = new Competitions();

        ddd($model);

        return $this->render('index.twig', [
            'model' => $model,
        ]);
    }

}
