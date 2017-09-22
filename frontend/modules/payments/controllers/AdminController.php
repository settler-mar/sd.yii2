<?php

namespace frontend\modules\payments\controllers;

use common\components\Help;
use common\models\Admitad;
use Yii;
use frontend\modules\payments\models\Payments;
use app\modules\payments\models\PaymentsSearch;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;
use kartik\daterange\DateRangePicker;

/**
 * AdminController implements the CRUD actions for Payments model.
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
   * Lists all Payments models.
   * @return mixed
   */
  public function actionIndex()
  {
    if (Yii::$app->user->isGuest || !Yii::$app->user->can('PaymentsView')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }
    $searchModel = new PaymentsSearch();
    $dataProvider = $searchModel->search(Yii::$app->request->queryParams);

    //получение статистики
    //для выборки
    $stat = clone $dataProvider->query;
    $stat = $stat->select(
      ['sum(order_price*kurs) as order_price',
        'sum(reward) as reward',
        'sum(cashback) as cashback',
        'sum(ref_bonus) as ref',
      ]);
    $statsQuery['all'] = $stat->asArray()->one();
    $statWait = clone $stat;
    $statRevoke = clone $stat;
    $statSuccess = clone $stat;
    $statsQuery['wait'] = $statWait->andWhere(['status' => 0])->asArray()->one();
    $statsQuery['revoke'] = $statRevoke->andWhere(['status' => 1])->asArray()->one();
    $statsQuery['success'] = $statSuccess->andWhere(['status' => 2])->asArray()->one();
    $statsQuery['users'] = $stat->groupBy('user_id')->count();

    $canAdmitadUpdate=false;
    $sort=trim(Yii::$app->request->get('sort'),'-');
    if(in_array($sort,array(null,'uid'))){
      $canAdmitadUpdate=true;
    }

    return $this->render('index.twig', [
      'searchModel' => $searchModel,
      'dataProvider' => $dataProvider,
      'canAdmitadUpdate'=>$canAdmitadUpdate,
      'sub_ids'=>Yii::$app->request->get('PaymentsSearch')['user_id'],
      'old_value_control'=>function ($model, $value, $index, $column){
        $name=$column->attribute;
        $old_name='old_'.$name;
        $out=$model->$name;
        if(
          isset($model->$old_name) &&
          $model->$old_name > 0 &&
          $model->$name!=$model->$old_name
        ){
          $out.='<span class="old_value value_'.($model->$name<$model->$old_name?'down':'up').'">
            '.$model->$old_name.'
            </span>';
        };
        if($model->cpa_id==1) {
          $out .= '<span data-col="'.$name.'" class="admitad_data"></span>';
        }
        return $out;
      },
      'data_ranger'=>Help::DateRangePicker($searchModel,'created_at_range',['hideInput'=>false]),
      'stats_query' => $statsQuery,
      //'stats_all' => $statsAll,
    ]);
  }

  public function actionAdmitadTest(){
    if (Yii::$app->user->isGuest || !Yii::$app->user->can('PaymentsView')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }

    $request=Yii::$app->request;
    if(!$request->isAjax || !$request->isPost){
      return $this->redirect(['index']);
    }

    $payments = Payments::find()
      ->where(['uid'=>$request->post('ids')])
      ->asArray()
      ->all();

    $user_ids=[];
    $payments_list=[];
    $min_date=false;
    $max_date=false;

    foreach ($payments as $payment){
      $data=strtotime($payment['click_date']);
      if(!$min_date || $min_date>$data){
        $min_date=$data;
      }
      if(!$max_date || $max_date<$data){
        $max_date=$data;
      }
      if(!in_array($payment['user_id'],$user_ids)){
        $user_ids[]=(int)$payment['user_id'];
      }
      if(!in_array($payment['action_id'],$payments_list)){
        $payments_list[$payment['action_id']]=$payment;
      }
    }

    $admitad = new Admitad();
    $pay_status = Admitad::getStatus();

    $params = [
      'limit' => 500,
      'offset' => 0,
      'date_start' => date('d.m.Y', $min_date - 86400 ),
    ];

    if($max_date <time()-90000) {
      $params['date_end'] = date('d.m.Y', $max_date + 86400);
    }

    if(count($user_ids)==1){
      $params['subid']=$user_ids[0];
    }


    $payments = $admitad->getPayments($params);
    $out=[];
    foreach ($payments['results'] as $payment) {
      if(!isset($payments_list[$payment['id']]))continue;

      $db_payment=$payments_list[$payment['id']];

      $status=isset($pay_status[$payment['status']]) ? $pay_status[$payment['status']] : 0;
      $kurs=$db_payment['kurs'];

      $reward=$payment['payment'].' '.$payment['currency'];
      if($kurs>1){
        $reward.=' x '.$kurs.' = '.
          number_format($payment['payment']*$kurs,2,'.',' ').
          ' RUB';
      }

      $err='<span class="warning_value"></span>';
      $wr_st=($status!=$db_payment['status']?$err:'');
      $wr_pr=($payment['cart']!=$db_payment['order_price']?$err:'');
      $wr_rf=(number_format($payment['payment']*$kurs,2,'.','')!=$db_payment['reward']?$err:'');

      $item=[
        'status'=>Yii::$app->help->colorStatus($status).$wr_st,
        'order_price'=>$payment['cart'].' '.$payment['currency'].$wr_pr,
        'reward'=>$reward.$wr_rf,
      ];
      $out[$db_payment['uid']]=$item;
    }

    return json_encode($out);
  }
  /**
   * Displays a single Payments model.
   * @param integer $id
   * @return mixed
   */
  public function actionView($id)
  {
    return $this->render('view.twig', [
      'model' => $this->findModel($id),
    ]);
  }

  /**
   * Creates a new Payments model.
   * If creation is successful, the browser will be redirected to the 'view' page.
   * @return mixed
   */
  public function actionCreate()
  {
    if (Yii::$app->user->isGuest || !Yii::$app->user->can('PaymentsCreate')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }
    $model = new Payments();

    if ($model->load(Yii::$app->request->post()) && $model->save()) {
      return $this->redirect(['index']);
    } else {
      return $this->render('create.twig', [
        'model' => $model,
      ]);
    }
  }

  /**
   * Updates an existing Payments model.
   * If update is successful, the browser will be redirected to the 'view' page.
   * @param integer $id
   * @return mixed
   */
  public function actionUpdate($id)
  {
    if (Yii::$app->user->isGuest || !Yii::$app->user->can('PaymentsEdit')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }
    $model = $this->findModel($id);

    if ($model->load(Yii::$app->request->post()) && $model->save()) {
      return $this->redirect(['index']);
    } else {
      return $this->render('update.twig', [
        'model' => $model,
      ]);
    }
  }

  /**
   * Deletes an existing Payments model.
   * If deletion is successful, the browser will be redirected to the 'index' page.
   * @return mixed
   */
  public function actionDelete()
  {
    if (Yii::$app->user->isGuest || !Yii::$app->user->can('PaymentsDelete')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }
    if (Yii::$app->request->isAjax) {
      $ids = Yii::$app->request->post('id');
      $validatorEach = new \yii\validators\EachValidator(['rule' => ['integer']]);
      if (!is_array($ids) || !$validatorEach->validate($ids)) {
        return json_encode(['error'=>true]);
      }

      Payments::deleteAll(['uid' => $ids]);
      return json_encode(['error' => false, 'html' => 'Записи удалены!']);

    } else {
      $id = Yii::$app->request->get('id');
      $this->findModel($id)->delete();

      return $this->redirect(['index']);
    }
//    $this->findModel($id)->delete();
//
//    return $this->redirect(['index']);
  }

  /**
   * Finds the Payments model based on its primary key value.
   * If the model is not found, a 404 HTTP exception will be thrown.
   * @param integer $id
   * @return Payments the loaded model
   * @throws NotFoundHttpException if the model cannot be found
   */
  protected function findModel($id)
  {
    if (($model = Payments::findOne($id)) !== null) {
      return $model;
    } else {
      throw new NotFoundHttpException('The requested page does not exist.');
    }
  }
}
