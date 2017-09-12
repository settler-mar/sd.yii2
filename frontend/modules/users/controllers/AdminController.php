<?php

namespace frontend\modules\users\controllers;

use frontend\modules\favorites\models\UsersFavorites;
use Yii;
use frontend\modules\users\models\Users;
use frontend\modules\users\models\UsersSearch;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;
use yii\data\Pagination;
use yii\helpers\Url;
use frontend\components\Pagination as SdPagination;

/**
 * AdminController implements the CRUD actions for Users model.
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
   * Lists all Users models.
   * @return mixed
   */
  public function actionIndex()
  {
    if (Yii::$app->user->isGuest ||  !Yii::$app->user->can('UserView')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }

    $get=Yii::$app->request->get();
    $query = Users::find();

    $w=[];
    if(isset($get['user_id']) && strlen($get['user_id'])>0){
      $query->andWhere(['uid'=>((int)$get['user_id'])]);
    }

    if(isset($get['ip']) && strlen($get['ip'])>0){
      $query->andWhere(['or','last_ip=\''.$get['ip'].'\'','reg_ip=\''.$get['ip'].'\'']);
    }

    if(isset($get['ref_id']) && strlen($get['ref_id'])>0){
      $query->andWhere(['referrer_id'=>((int)$get['ref_id'])]);
    }

    if(isset($get['email']) && strlen($get['email'])>0){
      $query->andWhere(['like','email',$get['email']]);
    }

    if (isset( $get['is_active'])) {
      if ($get['is_active'] == 1) {
        $query->andFilterWhere([
          'or',
          ['>', 'sum_pending', 0],
          ['>', 'sum_confirmed', 0],
          ['>', 'sum_from_ref_pending', 0],
          ['>', 'sum_from_ref_confirmed', 0],
        ]);
      } elseif ($get['is_active'] === '0') {
        $query->andWhere([
          'or',
          ['sum_pending' => null],
          ['=', 'sum_pending', 0]
        ]);
        $query->andWhere([
          'or',
          ['sum_confirmed' => null],
          ['=', 'sum_confirmed', 0]
        ]);
        $query->andWhere([
          'or',
          ['sum_from_ref_pending' => null],
          ['=', 'sum_from_ref_pending', 0]
        ]);
        $query->andWhere([
          'or',
          ['sum_from_ref_confirmed' => null],
          ['=', 'sum_from_ref_confirmed', 0]
        ]);

      }
    }

    $totQuery = clone $query;
    $totQuery=$totQuery
      ->select([
        'count(*) as total',
        'SUM(if((sum_pending>0 OR sum_confirmed>0 OR sum_from_ref_pending>0 OR sum_from_ref_confirmed>0)>0,1,0)) as active',
        'SUM(sum_pending) as sum_pending',
        'SUM(cnt_pending) as cnt_pending',
        'SUM(sum_confirmed) as sum_confirmed',
        'SUM(cnt_confirmed) as cnt_confirmed',
        'SUM(sum_from_ref_pending) as sum_from_ref_pending',
        'SUM(sum_from_ref_confirmed) as sum_from_ref_confirmed',
        'SUM(sum_to_friend_pending) as sum_to_ref_pending',
        'SUM(sum_to_friend_confirmed) as sum_to_ref_confirmed',
        'SUM(sum_foundation) as sum_foundation',
        'SUM(sum_withdraw) as sum_withdraw',
        'SUM(sum_bonus) as sum_bonus',
      ])
      ->asArray()
      ->one();

    $countQuery = clone $query;
    $pages = new Pagination(['totalCount' => $countQuery->count()]);


    $models = $query->offset($pages->offset)
      ->limit($pages->limit)
      ->orderBy('uid DESC')
      ->all();

    return $this->render('index', [
      'users' => $models,
      'pages' => $pages,
      'get'=>$get,
      'users_total'=>$totQuery,
    ]);
  }

  /**
   * Displays a single Users model.
   * @param integer $id
   * @return mixed
   */
  public function actionLogin($id)
  {
    if (Yii::$app->user->isGuest ||  !Yii::$app->user->can('UserLogin')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }

    Yii::$app->session->set('admin_id',Yii::$app->user->id);
    $user=Users::findOne(['uid'=>$id]);
    Yii::$app->user->login($user);
    return $this->redirect('/account');
  }

  /**
   * Creates a new Users model.
   * If creation is successful, the browser will be redirected to the 'view' page.
   * @return mixed
   */
  public function actionCreate()
  {
    if (Yii::$app->user->isGuest ||  !Yii::$app->user->can('UserCreate')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }
    $model = new Users();

    if ($model->load(Yii::$app->request->post()) && $model->save()) {
      return $this->redirect('/admin/users/update?id=' . $model->uid);
    } else {
      $loyalty_status_list = [];
      foreach (Yii::$app->params['dictionary']['loyalty_status'] as $k => $v) {
        $loyalty_status_list[$k] = $v['display_name'] . ' (' . $v['bonus'] . ')';
        if (isset($v['is_vip']) && $v['is_vip'] == 1) {
          $loyalty_status_list[$k] .= ' VIP клиент';
        }
      };

      $bonus_status_list = [];
      foreach (Yii::$app->params['dictionary']['bonus_status'] as $k => $v) {
        $bonus_status_list[$k] = $v['display_name'] . ' (' . $v['bonus'] . ')';
        if (isset($v['is_webmaster']) && $v['is_webmaster'] == 1) {
          $bonus_status_list[$k] .= ' для веб мастеров';
        }
      };

      $model->is_active = 1;
      $model->notice_email = 1;
      $model->registration_source = '';
      return $this->render('create.twig', [
        'model' => $model,
        'loyalty_status_list' => $loyalty_status_list,
        'bonus_status_list' => $bonus_status_list,
      ]);
    }
  }

  /**
   * Updates an existing Users model.
   * If update is successful, the browser will be redirected to the 'view' page.
   * @param integer $id
   * @return mixed
   */
  public function actionUpdate($id, $page=1)
  {
    if (Yii::$app->user->isGuest ||  !Yii::$app->user->can('UserEdit')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }

    $model = $this->findModel($id);

    if ($model->load(Yii::$app->request->post()) && $model->save()) {
      return $this->redirect('/admin/users/update?id=' . $model->uid);
    } else {

      $loyalty_status_list = [];
      foreach (Yii::$app->params['dictionary']['loyalty_status'] as $k => $v) {
        $loyalty_status_list[$k] = $v['display_name'] . ' (' . $v['bonus'] . ')';
        if (isset($v['is_vip']) && $v['is_vip'] == 1) {
          $loyalty_status_list[$k] .= ' VIP клиент';
        }
      };

      $bonus_status_list = [];
      foreach (Yii::$app->params['dictionary']['bonus_status'] as $k => $v) {
        $bonus_status_list[$k] = $v['display_name'] . ' (' . $v['bonus'] . ')';
        if (isset($v['is_webmaster']) && $v['is_webmaster'] == 1) {
          $bonus_status_list[$k] .= ' для веб мастеров';
        }
      };

      if(strlen($model->name)<1){
        $model->name=explode('@',$model->email);
        $model->name=$model->name[0];
      }

      $fav_store=UsersFavorites::find()
        ->where(['user_id'=>$id])
        ->all();

      foreach ($fav_store as $k => &$store){
        $store=$store->store;
        if(!$store){
          unset ($fav_store[$k]);
        }
      }

      $dataBase = Users::find()
        ->where(['referrer_id'=>$id])
        ->orderBy(['uid'=>'desc']);
      $pagination = new SdPagination($dataBase, false, ['page' => $page, 'limit' => 20, 'asArray' => false]);

      $ref_users = $pagination->data();

      return $this->render('update.twig', [
        'model' => $model,
        'loyalty_status_list' => $loyalty_status_list,
        'bonus_status_list' => $bonus_status_list,
        'fav_store'=>$fav_store,
        'ref_users'=>$ref_users,
        "pagination" => $pagination->getPagination('users/admin/update', ['id'=>$id]),
      ]);
    }
  }

  /**
   * Deletes an existing Users model.
   * If deletion is successful, the browser will be redirected to the 'index' page.
   * @param integer $id
   * @return mixed
   */
  public function actionDelete()
  {
    if (Yii::$app->user->isGuest ||  !Yii::$app->user->can('UserDelete')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }

    $user_id=Yii::$app->request->post('id');
    if((int)$user_id==0){
      throw new \yii\web\ForbiddenHttpException('Не указан id пользователя.');
      return false;
    }


    $this->findModel($user_id)->delete();
    return true;
  }

  /**
   * Finds the Users model based on its primary key value.
   * If the model is not found, a 404 HTTP exception will be thrown.
   * @param integer $id
   * @return Users the loaded model
   * @throws NotFoundHttpException if the model cannot be found
   */
  protected function findModel($id)
  {
    if (($model = Users::findOne($id)) !== null) {
      return $model;
    } else {
      throw new NotFoundHttpException('The requested page does not exist.');
    }
  }
}
