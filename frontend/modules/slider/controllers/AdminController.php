<?php

namespace frontend\modules\slider\controllers;

use frontend\modules\stores\models\Stores;
use Yii;
use frontend\modules\slider\models\Slider;
use app\modules\slider\models\SliderSearch;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;

/**
 * AdminController implements the CRUD actions for Slider model.
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

  /**
   * Lists all Slider models.
   * @return mixed
   */
  public function actionIndex()
  {
    if (Yii::$app->user->isGuest || !Yii::$app->user->can('SliderView')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }

    $searchModel = new SliderSearch();
    $dataProvider = $searchModel->search(Yii::$app->request->queryParams);

    return $this->render('index.twig', [
      'searchModel' => $searchModel,
      'dataProvider' => $dataProvider,
        'table_data' => [
            'is_showed' => function ($model, $value, $index, $column) {
              return $model->is_showed == 1 ? 'Отобразить' : 'Скрыть';
            },
        ],
    ]);
  }

  /**
   * Creates a new Slider model.
   * If creation is successful, the browser will be redirected to the 'view' page.
   * @return mixed
   */
  public function actionCreate()
  {
    if (Yii::$app->user->isGuest || !Yii::$app->user->can('SliderCreate')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }

    $model = new Slider();

    if ($model->load(Yii::$app->request->post()) && $model->save()) {
      Yii::$app->session->addFlash('info','Слайд создан');
      return $this->redirect(['update', 'id' => $model->uid]);
    } else {
      return $this->render('create.twig', [
        'model' => $model,
      ]);
    }
  }

  /**
   * Updates an existing Slider model.
   * If update is successful, the browser will be redirected to the 'view' page.
   * @param integer $id
   * @return mixed
   */
  public function actionUpdate($id)
  {
    if (Yii::$app->user->isGuest || !Yii::$app->user->can('SliderEdit')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }
    $model = $this->findModel($id);


    if ($model->load(Yii::$app->request->post()) && $model->save()) {
      Yii::$app->session->addFlash('info','Слайд обновлен');
      return $this->redirect(['index']);
    } else {
      return $this->render('update.twig', [
        'model' => $model
      ]);
    }
  }

  /**
   * Deletes an existing Slider model.
   * If deletion is successful, the browser will be redirected to the 'index' page.
   * @param integer $id
   * @return mixed
   */
  public function actionDelete($id)
  {
    if (Yii::$app->user->isGuest || !Yii::$app->user->can('SliderDelete')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }
    $this->findModel($id)->delete();

    return $this->redirect(['index']);
  }

  /**
   * Finds the Slider model based on its primary key value.
   * If the model is not found, a 404 HTTP exception will be thrown.
   * @param integer $id
   * @return Slider the loaded model
   * @throws NotFoundHttpException if the model cannot be found
   */
  protected function findModel($id)
  {
    if (($model = Slider::findOne($id)) !== null) {
      return $model;
    } else {
      throw new NotFoundHttpException('The requested page does not exist.');
    }
  }

  function beforeAction($action)
  {
    $this->layout = '@app/views/layouts/admin.twig';
    return true;
  }
}
