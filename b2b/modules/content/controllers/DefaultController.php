<?php

namespace b2b\modules\content\controllers;

use frontend\modules\b2b_content\models\B2bContent;
use frontend\modules\b2b_users\models\B2bUsers;
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
      $model= new Regform;

      $request = Yii::$app->request;
      if($model->load($request->post())) {
        $user = new B2bUsers;

        $user->password=$model->password;
        $user->fio = $model->fio;
        $user->position = $model->position;
        $user->email = $model->email;
        $user->phone = $model->phone;
        $user->anketa = json_encode([
          'firm'=>$model->firm,
          'url'=>$model->url,
          'category'=>$model->category,
          'region'=>$model->region,
          'type'=>$model->type,
          'old'=>$model->old,
          'points'=>$model->points,
        ]);
        if($user->save()){
          $model= new Regform;
          Yii::$app->session->addFlash('info', 'Ваша заяка отправленна. В ближайшее время с Вами свяжится администратор.');
          $page['before_include']='reg_finish';
        }
      }

      $page['model']=$model;
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
