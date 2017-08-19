<?php

namespace frontend\modules\reviews\controllers;

use frontend\components\SdController;
use frontend\modules\reviews\models\Reviews;
use frontend\modules\users\models\Users;
use frontend\components\Pagination;

class DefaultController extends SdController
{
    public function actionIndex()
    {
        $request = \Yii::$app->request;
        $page = $request->get('page');

        $validator = new \yii\validators\NumberValidator();

        if (!empty($page) && !$validator->validate($page)) {
            throw new \yii\web\NotFoundHttpException;
        };
        
        $cacheName = 'reviews_'.$page;
        $databaseObj = Reviews::find()
            ->select(['ur.*', "u.email", "u.name", "u.photo", "u.sex"])
            ->from(Reviews::tableName(). ' ur')
            ->innerJoin(Users::tableName() . ' u', 'ur.user_id = u.uid')
            ->where(["u.is_active" => 1, "ur.is_active" => 1])
            ->orderBy('added DESC');

        $pagination = new Pagination($databaseObj, $cacheName, ['limit' => 10, 'page'=> $page, 'asArray' => true]);
        $contentData["reviews"] = $pagination->data();

        if ($pagination->pages() > 1) {
            $contentData["pagination"] = $pagination->getPagination($request->pathInfo, []);
            $this->makePaginationTags($request->pathInfo, $pagination->pages(), $page, []);
        }

        $this->params['breadcrumbs'][] = ['label' => 'Отзывы о сайте', 'url' => '/reviews'];
        if ($page > 1) {
            $this->params['breadcrumbs'][] = 'Страница ' . $page;
        }
        if (isset($this->params['breadcrumbs'][intval(count($this->params['breadcrumbs'])) - 1]['url'])) {
            $this->params['breadcrumbs'][intval(count($this->params['breadcrumbs'])) - 1]['url'] = null;
        }

        return $this->render('index', $contentData);
    }
}
