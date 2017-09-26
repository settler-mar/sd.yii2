<?php

namespace b2b\modules\content\controllers;

use yii\web\Controller;
use Yii;

class DefaultController extends Controller
{
    public function actionIndex()
    {
        $page = Yii::$app->params['page_content'];

        Yii::$app->view->registerMetaTag([
          'name' => 'description',
          'content' => $page->description,
        ]);
        Yii::$app->view->registerMetaTag([
          'name' => 'keywords',
          'content' => $page->keywords,
        ]);

        return $this->render('index', [
            'title' => $page->title,
            'h1' => $page->h1,
            'content' => $page->content,
        ]);
    }
}
