<?php

namespace frontend\modules\notification\controllers;

use common\components\Help;
use Yii;
use frontend\modules\notification\models\Notifications;
use frontend\modules\notification\models\NotificationsSearch;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;

/**
 * AdminController implements the CRUD actions for Notifications model.
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

  function beforeAction($action)
  {
    $this->layout = '@app/views/layouts/admin.twig';
    return true;
  }

  /**
   * Lists all Notifications models.
   * @return mixed
   */
  public function actionIndex()
  {
    $searchModel = new NotificationsSearch();

    $dataProvider = $searchModel->search(Yii::$app->request->queryParams);

    $type_list=array_merge([
      ''=>'Любой',
    ],(\Yii::$app->params['dictionary']['notification_type']));
    return $this->render('index.twig', [
      'searchModel' => $searchModel,
      'dataProvider' => $dataProvider,
      'data_ranger'=>Help::DateRangePicker($searchModel,'added_range',['hideInput'=>false]),
      'type_list'=>$type_list,
    ]);
  }

  /**
   * Creates a new Notifications model.
   * If creation is successful, the browser will be redirected to the 'view' page.
   * @return mixed
   */
  public function actionCreate()
  {
    $model = new Notifications();

    if ($model->load(Yii::$app->request->post()) && $model->save()) {
      return $this->redirect(['update', 'id' => $model->uid]);
    } else {
      $model->status=2;
      $model->twig_template=2;
      $model->type_id=2;
      $model->added=date('Y-m-d H:i:s');
      return $this->render('create.twig', [
        'model' => $model,
        'type_list'=>\Yii::$app->params['dictionary']['notification_type'],
        'twig_template_list'=>\Yii::$app->params['dictionary']['twig_list_name'],
      ]);
    }
  }

  /**
   * Updates an existing Notifications model.
   * If update is successful, the browser will be redirected to the 'view' page.
   * @param integer $id
   * @return mixed
   */
  public function actionUpdate($id)
  {
    $model = $this->findModel($id);

    if ($model->load(Yii::$app->request->post()) && $model->save()) {
      return $this->redirect(['update', 'id' => $model->uid]);
    } else {
      return $this->render('update.twig', [
        'model' => $model,
        'type_list'=>\Yii::$app->params['dictionary']['notification_type'],
        'twig_template_list'=>\Yii::$app->params['dictionary']['twig_list_name'],
      ]);
    }
  }

  /**
   * Deletes an existing Notifications model.
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
   * Finds the Notifications model based on its primary key value.
   * If the model is not found, a 404 HTTP exception will be thrown.
   * @param integer $id
   * @return Notifications the loaded model
   * @throws NotFoundHttpException if the model cannot be found
   */
  protected function findModel($id)
  {
    if (($model = Notifications::findOne($id)) !== null) {
      return $model;
    } else {
      throw new NotFoundHttpException('The requested page does not exist.');
    }
  }
}
