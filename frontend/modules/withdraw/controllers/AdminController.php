<?php

namespace frontend\modules\withdraw\controllers;

use frontend\modules\withdraw\models\WithdrawProcess;
use Yii;
use frontend\modules\withdraw\models\UsersWithdraw;
use frontend\modules\withdraw\models\UsersWithdrawSearch;
use frontend\modules\users\models\Users;
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

    //статистика полная
    $stats['summ_all'] = UsersWithdraw::find()
      ->from(UsersWithdraw::tableName(). ' cwuw')
      ->innerJoin(Users::tableName().' cwu', 'cwu.uid = cwuw.user_id')
      ->select(['sum(amount) as summ', 'cwu.currency as currency'])
      ->groupBy('cwu.currency')
      ->asArray()
      ->all();
    $stats['users_all'] = UsersWithdraw::find()->select(['user_id'])->groupBy('user_id')->count();

    //статистика для выборки
    $statUsers = clone $dataProvider->query;
    $statSumm = clone $dataProvider->query;
    $stats['summ'] = $statSumm
      ->innerJoin(Users::tableName().' cwu', 'cwu.uid = cw_users_withdraw.user_id')
      ->select(['sum(amount) as summ', 'cwu.currency as currency'])
      ->groupBy('cwu.currency')
      ->asArray()
      ->all();
    $stats['users'] = $statUsers->select(['user_id'])->groupBy('user_id')->count();


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
          $out .= '" target=_blank rel="nofollow noopener">';
          $out .= $user->email;
          $out .= ' (';
          $out .= $user->uid;
          $out .= ')</a>';
          return $out;
        },
        'status' => function ($model, $key, $index, $column) {
          return Yii::$app->help->colorStatus($model->status);
        },
        'process' => function ($model, $key, $index, $column) {
          return $model->process_name;
        },
        'amount' => function($model, $key, $index, $column) {
            return $model->amount. ' '.$model->user->currency;
        },
        'ip' => function($model, $key, $index, $column) {
          $out=[];
          if(!empty($model->ip)){
            $out[]='вывод:'.$model->ip;
          }
          $user=$model->user;
          if(!empty($user->last_ip)){
            $out[]='login:'.$user->last_ip;
          }
          if(!empty($user->reg_ip)){
            $out[]='reg:'.$user->reg_ip;
          }
          //ddd($model->user);
          return implode('<br>',$out);
        }
      )
      ,
      'stat' => $stats,
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
   * Deletes an existing UserWithdraw model.
   */
  public function actionDelete()
  {
    if (Yii::$app->user->isGuest || !Yii::$app->user->can('WithdrawDelete')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }
    if (Yii::$app->request->isAjax) {
      $ids = Yii::$app->request->post('id');
      $validatorEach = new \yii\validators\EachValidator(['rule' => ['integer']]);
      if (!is_array($ids) || !$validatorEach->validate($ids)) {

        Yii::$app->session->addFlash('err','Ошибка');
        return json_encode(['error'=>true]);
      }

      UsersWithdraw::deleteAll(['uid' => $ids]);
      Yii::$app->session->addFlash('info','Записи удалены');
      return json_encode(['error' => false, 'html' => 'Записи удалены!']);

    } else {
      throw new \yii\web\NotFoundHttpException();
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
