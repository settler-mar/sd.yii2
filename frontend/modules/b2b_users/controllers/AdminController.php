<?php

namespace frontend\modules\b2b_users\controllers;

use frontend\modules\b2b_users\models\B2bNewUsers;
use Yii;
use frontend\modules\b2b_users\models\B2bUsers;
use frontend\modules\b2b_users\models\B2bUsersSearch;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;

/**
 * AdminController implements the CRUD actions for B2bUsers model.
 */
class AdminController extends Controller
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

  public function beforeAction($action)
  {
    //todo нужна проверка на админа
    if (Yii::$app->user->isGuest) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
    }
    $this->layout = '@app/views/layouts/admin.twig';
    return true;
  }

  /**
   * Lists all B2bUsers models.
   * @return mixed
   */
  public function actionIndex()
  {
    $searchModel = new B2bUsersSearch();
    $dataProvider = $searchModel->search(Yii::$app->request->queryParams);

    return $this->render('index.twig', [
      'searchModel' => $searchModel,
      'dataProvider' => $dataProvider,
    ]);
  }

  /**
   * Creates a new B2bUsers model.
   * If creation is successful, the browser will be redirected to the 'view' page.
   * @return mixed
   */
  public function actionCreate()
  {
    $model = new B2bNewUsers();

    if ($model->load(Yii::$app->request->post()) && $model->save()) {
      return $this->redirect(['update', 'id' => $model->id]);
    } else {
      return $this->render('create.twig', [
        'model' => $model,
      ]);
    }
  }

  /**
   * Updates an existing B2bUsers model.
   * If update is successful, the browser will be redirected to the 'view' page.
   * @param integer $id
   * @return mixed
   */
  public function actionUpdate($id)
  {
    $model = $this->findModel($id);

    if ($model->load(Yii::$app->request->post()) && $model->save()) {
      return $this->redirect(['index']);
    } else {
      return $this->render('update.twig', [
        'model' => $model,
        'user_id' => $id,
      ]);
    }
  }

  public function actionAddStore($id)
  {
    $out = [
      'html' => $this->renderAjax('add_shop_step1.twig', [
        'user_id' => $id,
      ]),
    ];

    return json_encode($out);
  }

  /**
   * Deletes an existing B2bUsers model.
   * If deletion is successful, the browser will be redirected to the 'index' page.
   * @param integer $id
   * @return mixed
   */
  public function actionDelete($id)
  {
    $this->findModel($id)->delete();

    return $this->redirect(['index']);
  }

  /**
   * Finds the B2bUsers model based on its primary key value.
   * If the model is not found, a 404 HTTP exception will be thrown.
   * @param integer $id
   * @return B2bUsers the loaded model
   * @throws NotFoundHttpException if the model cannot be found
   */
  protected function findModel($id)
  {
    if (($model = B2bUsers::findOne($id)) !== null) {
      return $model;
    } else {
      throw new NotFoundHttpException('The requested page does not exist.');
    }
  }
}
