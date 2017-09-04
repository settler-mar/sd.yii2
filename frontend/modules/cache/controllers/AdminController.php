<?php

namespace frontend\modules\cache\controllers;

use yii;
use frontend\modules\cache\models\Cache;

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
        //todo нужна проверка на админа
        if (Yii::$app->user->isGuest) {
            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
        }
        return true;
    }

    /**
     * @return mixed
     * @throws yii\web\notFoundHTTPException
     */
    public function actionClear()
    {
        $request = \Yii::$app->request;
        if (!$request->isAjax) {
            throw new yii\web\notFoundHTTPException;
        } else {
            Cache::clear();
            return json_encode(['html' => 'Кэш очищен. Данные экспорта обновлены.']);
        }
    }

}
