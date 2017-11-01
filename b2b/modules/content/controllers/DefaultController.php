<?php

namespace b2b\modules\content\controllers;

use frontend\modules\b2b_content\models\B2bContent;
use frontend\modules\b2b_users\models\B2bUsers;
use yii\web\Controller;
use Yii;
use b2b\modules\forms\models\Regform;
use b2b\modules\forms\models\RegisterForm;

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

    return $this->render('index', $page);
  }

  public function actionMain()
  {
    $index = B2bContent::findOne(['page' => 'index']);
    $index->no_breadcrumbs = true;
    Yii::$app->params['page_content'] = $index;
    return $this->actionIndex();
  }

  protected function sendRegistration($mailTo, $model)
  {
    return Yii::$app->mailer->compose(
        ['html' => 'b2b-register-form-html', 'text' => 'b2b-register-form-text'],
        [
          'message' => $model->text,
          'title' => $model->subject,
          'name' => $model->name,
          'email' => $model->email,
          'phone' => $model->phone,
        ]
      )
      ->setFrom([Yii::$app->params['adminEmail'] => Yii::$app->params['adminName'] . ' robot'])
      ->setTo($mailTo)
      ->setSubject($model->subject)
      ->send();
  }
}
