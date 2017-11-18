<?php

namespace frontend\modules\users\controllers;

use Yii;
use frontend\modules\users\models\UsersSocial;
use frontend\modules\users\models\UsersSocialSearch;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;

/**
 * AdminSocialController implements the CRUD actions for UsersSocial model.
 */
class AdminSocialController extends Controller
{
  public function behaviors()
  {
    return [
      'verbs' => [
        'class' => VerbFilter::className(),
        'actions' => [
          'delete' => ['post'],
        ],
      ],
    ];
  }


  function beforeAction($action)
  {
    $this->layout = '@app/views/layouts/admin.twig';
    return true;
  }

  /**
   * Lists all UsersSocial models.
   * @return mixed
   */
  public function actionIndex()
  {

    if (Yii::$app->user->isGuest ||  !Yii::$app->user->can('UsersSocialView')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }

    $searchModel = new UsersSocialSearch();
    $dataProvider = $searchModel->search(Yii::$app->request->queryParams);

    $services=Yii::$app->get('eauth')->services;
    $social_list=[];
    foreach ($services as $s) {
      $s = (array)$s;
      $social_list[$s['id']] = $s['id'];
    }

    return $this->render('index.twig', [
      'searchModel' => $searchModel,
      'dataProvider' => $dataProvider,
      'social_list' => $social_list,
      'table_value' => [
        'user' => function ($model, $key, $index, $column) {
          $user = $model->getUser();
          $out = '<a href="/admin/users/update?id=';
          $out .= $user->uid;
          $out .= '" target=_blank>';
          $out .= $user->email;
          $out .= ' (';
          $out .= $user->uid;
          $out .= ')</a>';
          return $out;
        },
      ]
    ]);
  }


  /**
   * Updates an existing UsersSocial model.
   * If update is successful, the browser will be redirected to the 'view' page.
   * @param integer $id
   * @return mixed
   */
  public function actionUpdate($id)
  {

    if (Yii::$app->user->isGuest ||  !Yii::$app->user->can('UsersSocialEdit')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }

    $model = $this->findModel($id);

    if ($model->load(Yii::$app->request->post()) && $model->save()) {
      Yii::$app->session->setFlash('info','Данные социальной сети обновленны');
      return $this->redirect(['update', 'id' => $model->uid]);
    } else {

      $services=Yii::$app->get('eauth')->services;
      $social_list=[];
      foreach ($services as $s) {
        $s = (array)$s;
        $social_list[$s['id']] = $s['id'];
      }

      return $this->render('update.twig', [
        'model' => $model,
        'social_list' => $social_list,
      ]);
    }
  }

  /**
   * Deletes an existing UsersSocial model.
   * If deletion is successful, the browser will be redirected to the 'index' page.
   * @param integer $id
   * @return mixed
   */
  public function actionDelete($id)
  {
    if (Yii::$app->user->isGuest ||  !Yii::$app->user->can('UsersSocialDelete')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }

    $this->findModel($id)->delete();

    return $this->redirect(['index']);
  }

  /**
   * Finds the UsersSocial model based on its primary key value.
   * If the model is not found, a 404 HTTP exception will be thrown.
   * @param integer $id
   * @return UsersSocial the loaded model
   * @throws NotFoundHttpException if the model cannot be found
   */
  protected function findModel($id)
  {
    if (($model = UsersSocial::findOne($id)) !== null) {
      return $model;
    } else {
      throw new NotFoundHttpException('The requested page does not exist.');
    }
  }
}
