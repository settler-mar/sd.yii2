<?php

namespace frontend\modules\favorites\controllers;

use yii;
use frontend\modules\favorites\models\UsersFavorites;
use frontend\modules\stores\models\Stores;
use frontend\components\Pagination;

class AccountController extends \yii\web\Controller
{
    /**
     * @param yii\base\Action $action
     * @return bool
     * @throws yii\web\ForbiddenHttpException
     */
    public function beforeAction($action)
    {
        if (Yii::$app->user->isGuest) {
            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
            return false;
        }
        $this->layout = '@app/views/layouts/account.twig';
        return true;
    }

    public function actionIndex()
    {

        $cacheName = 'account_favorites_' . \Yii::$app->user->id;
        $contentData["favorites"] = \Yii::$app->cache->getOrSet($cacheName, function () {
            return UsersFavorites::find()
                ->from(UsersFavorites::tableName() . ' cuf')
                ->select(['cws.*'])
                ->innerJoin(Stores::tableName(). ' cws', 'cws.uid = cuf.store_id')
                ->where(["cuf.user_id" => \Yii::$app->user->id, "cws.is_active" => [0, 1]])
                ->orderBy('cuf.added DESC')
                ->asArray()
                ->all();
        });
        $contentData["favids"] = array_column($contentData["favorites"], 'uid');

        return $this->render('index', $contentData);
    }

}
