<?php

namespace b2b\modules\content\controllers;

use frontend\modules\b2b_content\models\B2bContent;
use frontend\modules\b2b_users\models\B2bUsers;
use yii\web\Controller;
use Yii;
use b2b\models\Regform;
use b2b\models\RegisterForm;

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
        $user->anketa = [
          'firm'=>$model->firm,
          'url'=>$model->url,
          'category'=>$model->category,
          'region'=>$model->region,
          'type'=>$model->type,
          'old'=>$model->old,
          'points'=>$model->points,
        ];
        if($user->save()){
          Yii::$app->session->addFlash('info', 'Ваша заяка отправлена. В ближайшее время с Вами свяжется администратор.');
          return $this->redirect('/registration_finish');
        }
      }

      $page['model']=$model;
      $page['reCaptcha']= \himiklab\yii2\recaptcha\ReCaptcha::className();
    };
    if (isset($page->page) && in_array($page->page, ['affiliate-offline', 'online'])) {
      $page=$page->toArray();
      $request = Yii::$app->request;

      if ($request->isAjax) {
        $model = new RegisterForm;
        if ($model->load($request->post())) {
          if ($this->sendRegistration($model)) {
            Yii::$app->session->addFlash('success', 'Сообщение отправлено, мы свяжемся с вами в ближайшее время.');
            return json_encode(['error'=>false]);
          } else {
            return json_encode(['error'=>true]);
          }
        } else {
          return json_encode(['error'=>true]);
        }
      }
    }

    return $this->render('index', $page);
  }

  public function actionMain()
  {
    $index = B2bContent::findOne(['page' => 'index']);
    $index->no_breadcrumbs = true;
    Yii::$app->params['page_content'] = $index;
    return $this->actionIndex();
  }

  protected function sendRegistration($model)
  {
    return Yii::$app->mailer->compose(
        ['html' => 'b2b-register-form-html', 'text' => 'b2b-register-form-text'],
        ['message' => $model->text, 'title' => $model->subject]
      )
      ->setFrom([Yii::$app->params['adminEmail'] => Yii::$app->params['adminName'] . ' robot'])
      ->setTo(Yii::$app->params['registerEmail'])
      ->setSubject($model->subject)
      ->send();
  }
}
