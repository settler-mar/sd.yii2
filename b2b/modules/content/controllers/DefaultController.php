<?php

namespace b2b\modules\content\controllers;

use frontend\modules\b2b_content\models\B2bContent;
use yii\web\Controller;
use Yii;
use b2b\models\Regform;

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

    if($page->page=='registration'){
      $page=$page->toArray();
      $page['before_include']='reg_form';
      $page['model']= new Regform;
      $page['reCaptcha']= \himiklab\yii2\recaptcha\ReCaptcha::className();
    };

    return $this->render('index', $page);
  }

  public function actionMain()
  {
    $index = B2bContent::findOne(['page' => 'index']);
    $index->no_breadcrumbs = true;
    Yii::$app->params['page_content'] = $index;
    return $this->actionIndex();
  }
}
