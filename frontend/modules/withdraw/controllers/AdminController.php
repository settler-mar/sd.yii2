<?php

namespace frontend\modules\withdraw\controllers;

use frontend\modules\withdraw\models\WithdrawProcess;
use Yii;
use frontend\modules\withdraw\models\UsersWithdraw;
use frontend\modules\withdraw\models\UsersWithdrawSearch;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;

/**
 * AdminController implements the CRUD actions for UsersWithdraw model.
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
   * Lists all UsersWithdraw models.
   * @return mixed
   */
  public function actionIndex()
  {
    if (Yii::$app->user->isGuest ||  !Yii::$app->user->can('WithdrawView')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }

    $searchModel = new UsersWithdrawSearch();
    $dataProvider = $searchModel->search(Yii::$app->request->queryParams);

    $process=WithdrawProcess::find()
      ->asArray()
      ->all();
    $process_name=[''=>'Любой'];
    foreach ($process as $item){
      $process_name[$item['uid']]=$item['name'];
    }

    return $this->render('index.twig', [
      'searchModel' => $searchModel,
      'dataProvider' => $dataProvider,
      'process_list'=>$process_name,
      'table_value' => array(
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
        'status' => function ($model, $key, $index, $column) {
          $st=$model->status;
          if($st==0){
            $st=1;
          }elseif($st==1){
            $st=0;
          }
          return Yii::$app->help->colorStatus($st);
        },
        'process' => function ($model, $key, $index, $column) {
          return $model->process_name;
        },
      )
    ]);
  }


  /**
   * Updates an existing UsersWithdraw model.
   * If update is successful, the browser will be redirected to the 'view' page.
   * @param integer $id
   * @return mixed
   */
  public function actionUpdate($id)
  {
    if (Yii::$app->user->isGuest ||  !Yii::$app->user->can('WithdrawEdit')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }

    $model = $this->findModel($id);

    if ($model->load(Yii::$app->request->post()) && $model->save()) {
      return $this->redirect(['index']);
    } else {
      $process=WithdrawProcess::find()
        ->asArray()
        ->all();
      $process_name=[''=>'Любой'];
      foreach ($process as $item){
        $process_name[$item['uid']]=$item['name'];
      }

      return $this->render('update.twig', [
        'model' => $model,
        'process_list'=>$process_name,
      ]);
    }
  }


  /**
   * Finds the UsersWithdraw model based on its primary key value.
   * If the model is not found, a 404 HTTP exception will be thrown.
   * @param integer $id
   * @return UsersWithdraw the loaded model
   * @throws NotFoundHttpException if the model cannot be found
   */
  protected function findModel($id)
  {
    if (($model = UsersWithdraw::findOne($id)) !== null) {
      return $model;
    } else {
      throw new NotFoundHttpException('The requested page does not exist.');
    }
  }
}
