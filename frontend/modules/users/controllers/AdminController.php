<?php

namespace frontend\modules\users\controllers;

use frontend\modules\favorites\models\UsersFavorites;
use Yii;
use frontend\modules\users\models\Users;
use frontend\modules\withdraw\models\UsersWithdraw;
use frontend\modules\reviews\models\Reviews;
use frontend\modules\users\models\UsersSearch;
use frontend\modules\users\models\UsersExport;
use frontend\modules\b2b_users\models\B2bUsers;
use frontend\modules\charity\models\Charity;
use frontend\modules\actions\models\ActionsToUsers;
use frontend\modules\actions\models\ActionsConditions;
use frontend\modules\actions\models\Actions;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;
use yii\data\Pagination;
use yii\helpers\Url;
use frontend\components\Pagination as SdPagination;
use yii\widgets\MaskedInput;
use common\components\Help;

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
    if (Yii::$app->user->isGuest || !Yii::$app->user->can('UserView')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }

    $get = Yii::$app->request->get();
    $query = Users::find();

    $w = [];
    if (isset($get['user_id']) && strlen($get['user_id']) > 0) {
      $query->andWhere(['cw_users.uid' => ((int)$get['user_id'])]);
    }

    if (isset($get['ip']) && strlen($get['ip']) > 0) {
      $query->andWhere(['or', 'cw_users.last_ip=\'' . $get['ip'] . '\'', 'cw_users.reg_ip=\'' . $get['ip'] . '\'']);
    }

    if (isset($get['ref_id']) && strlen($get['ref_id']) > 0) {
      $query->andWhere(['cw_users.referrer_id' => ((int)$get['ref_id'])]);
    }

    if (isset($get['email']) && strlen($get['email']) > 0) {
      $query->andWhere(['like', 'cw_users.email', $get['email']]);
    }
    if (isset($get['wait-moderation']) && strlen($get['wait-moderation']) > 0) {
      $query->andWhere(['cw_users.waitModeration' => $get['wait-moderation']]);
    }
    if (isset($get['loyalty_status']) && strlen($get['loyalty_status']) > 0) {
        if ($get['loyalty_status'] == 'personal') {
            $query->andWhere(['>', 'cw_users.loyalty_status', 4]);
        } else {
            $query->andWhere(['cw_users.loyalty_status' => $get['loyalty_status']]);
        }
    }

    if (isset($get['is_active'])) {
      if ($get['is_active'] == 1) {
        $query->andFilterWhere([
            'or',
            ['>', 'cw_users.sum_pending', 0],
            ['>', 'cw_users.sum_confirmed', 0],
            ['>', 'cw_users.sum_from_ref_pending', 0],
            ['>', 'cw_users.sum_from_ref_confirmed', 0],
        ]);
      } elseif ($get['is_active'] === '0') {
        $query->andWhere([
            'or',
            ['cw_users.sum_pending' => null],
            ['=', 'cw_users.sum_pending', 0]
        ]);
        $query->andWhere([
            'or',
            ['cw_users.sum_confirmed' => null],
            ['=', 'cw_users.sum_confirmed', 0]
        ]);
        $query->andWhere([
            'or',
            ['cw_users.sum_from_ref_pending' => null],
            ['=', 'cw_users.sum_from_ref_pending', 0]
        ]);
        $query->andWhere([
            'or',
            ['cw_users.sum_from_ref_confirmed' => null],
            ['=', 'cw_users.sum_from_ref_confirmed', 0]
        ]);

      }
    }
    if ((isset($get['completed_to']) && (int) $get['completed_to'] > 0) || (isset($get['joined_to']) && (int) $get['joined_to'] > 0)) {
      $query->innerJoin(ActionsToUsers::tableName() . ' cwau', 'cwau.user_id = cw_users.uid');

      if (isset($get['completed_to']) && (int) $get['completed_to'] > 0) {
        $query->andWhere(['cwau.action_id'=>(int) $get['completed_to'], 'cwau.complete'=> 1]);
      }

      if (isset($get['joined_to']) && (int) $get['joined_to'] > 0) {
        $query->andWhere(['cwau.action_id'=>(int) $get['joined_to']]);
      }
    }


    $search_range = Yii::$app->request->get('date_range_added');
    if (empty($search_range) || strpos($search_range, '-') === false) {
      $search_range = date('01-01-2017') . ' - ' . date('d-m-Y');
    }


    list($start_date, $end_date) = explode(' - ', $search_range);
    $data_ranger_added = Help::DateRangePicker($start_date . ' - ' . $end_date,'date_range_added');

    $start_date = date('Y-m-d', strtotime($start_date));
    $end_date = date('Y-m-d', strtotime($end_date));
    $query->andFilterWhere(['between', 'cw_users.added', $start_date . ' 00:00:00', $end_date . ' 23:59:59']);

    if (isset($get['expected_to']) && (int) $get['expected_to'] > 0) {
      //возможные участники акции
      $actionQuery = Actions::makeUsersExpectedQuery($get['expected_to']);//формируем where для cw_users
      if (!empty($actionQuery)) {
        $query->andWhere($actionQuery);
      }
    }

    $totQueryCount = clone $query;
    $totQuerySumm = clone $query;
    $totQueryRef = clone $query;
    $totQueryCount = $totQueryCount
        ->select([
            'count(*) as total',
            'SUM(if((sum_pending>0 OR sum_confirmed>0 OR sum_from_ref_pending>0 OR sum_from_ref_confirmed>0)>0,1,0)) as active',
            'SUM(cnt_pending) as cnt_pending',
            'SUM(cnt_confirmed) as cnt_confirmed',
        ])
        ->asArray()
        ->one();
    $totQuerySumm = $totQuerySumm
        ->select([
            'SUM(sum_pending) as sum_pending',
            'SUM(sum_confirmed) as sum_confirmed',
            'SUM(sum_from_ref_pending) as sum_from_ref_pending',
            'SUM(sum_from_ref_confirmed) as sum_from_ref_confirmed',
            'SUM(sum_foundation) as sum_foundation',
            'SUM(sum_withdraw) as sum_withdraw',
            'SUM(sum_bonus) as sum_bonus',
            'currency'
        ])
        ->groupby('currency')
        ->asArray()
        ->all();
    $totQueryRef = $totQueryRef
        ->select([
            'SUM(cw_users.sum_to_friend_pending) as sum_to_friend_pending',
            'SUM(cw_users.sum_to_friend_confirmed) as sum_to_friend_confirmed',
            'user2.currency'
        ])
        ->andWhere(['is not', 'user2.currency', null])
        ->leftJoin(Users::tableName(). ' user2', 'user2.uid = cw_users.referrer_id')
        ->groupby('user2.currency')
        ->asArray()
        ->all();

    $countQuery = clone $query;
    $pages = new Pagination(['totalCount' => $countQuery->count()]);

    $notes['users_withdraw'] = UsersWithdraw::waitingCount();
    $notes['users_reviews'] = Reviews::waitingCount();
    $notes['users_charity'] = Charity::waitingCount();
    $notes['b2b_users_requests'] = B2bUsers::requestRegisterCount();
    $notes['users_wait_moderation'] = Users::waitModerationCount();
    $notes['users_on_actions'] = Users::onActionCount();

    $sortOrder = isset($get['order']) && $get['order'] == 'ASC' ? SORT_ASC : SORT_DESC;
    if (!empty($get['sort'])) {
        $query->orderBy([$get['sort'] => $sortOrder]);
    } else {
        $query->orderBy(['uid' => $sortOrder]);
    }

    Yii::info('query');
    $models = $query->offset($pages->offset)
        ->limit($pages->limit)
        ->all();
    $loyaltyStatuses = clone $query;
    $loyaltyStatuses = $loyaltyStatuses
        ->select(['loyalty_status', 'count(*) as count'])
        ->groupBy('loyalty_status')
        ->orderBy(['loyalty_status' => SORT_ASC])
        ->asArray()
        ->all();

    return $this->render('index', [
        'users' => $models,
        'pages' => $pages,
        'get' => $get,
        'users_total' => $totQueryCount,
        'users_summ' => $totQuerySumm,
        'users_ref' => $totQueryRef,
        'notes' => $notes,
        'loyalty_statuses' => $loyaltyStatuses,
        'data_ranger_added' => $data_ranger_added,
        'actions' => Actions::find()->select(['uid', 'name']) ->asArray()->all(),
        'get_params' => http_build_query($get),
    ]);
  }

  public function actionAction()
  {
    if (Yii::$app->user->isGuest || !Yii::$app->user->can('UserView')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }

    $users = Users::find()
        ->alias('user')
        ->andFilterWhere(['>', 'user.in_action', 0])
        ->join('LEFT JOIN', 'cw_users ref', 'ref.referrer_id = user.uid and ref.added > user.in_action')
        ->select([
            'user.*',
            'count(ref.uid) as reg_by_action',
            'sum(if(ref.sum_confirmed>350,1,0)) as finish_by_action',

        ])
        ->groupBy('user.uid')
        ->orderBy(['finish_by_action' => SORT_DESC])
        //->asArray()
        ->all();

    return $this->render('action', [
        'users' => $users,
    ]);
  }

  /**
   * Displays a single Users model.
   * @param integer $id
   * @return mixed
   */
  public function actionLogin($id)
  {
    if (Yii::$app->user->isGuest || !Yii::$app->user->can('UserLogin')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }

    Yii::$app->session->set('admin_id', Yii::$app->user->id);
    $user = Users::findOne(['uid' => $id]);
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
    if (Yii::$app->user->isGuest || !Yii::$app->user->can('UserCreate')) {
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
          'traffTypeList' => Users::trafficTypeList(),
          'MaskedInput_class' => MaskedInput::className()
      ]);
    }
  }

  /**
   * Updates an existing Users model.
   * If update is successful, the browser will be redirected to the 'view' page.
   * @param integer $id
   * @return mixed
   */
  public function actionUpdate($id, $page = 1)
  {
    if (Yii::$app->user->isGuest || !Yii::$app->user->can('UserEdit')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }

    $model = $this->findModel($id);

    if ($model->load(Yii::$app->request->post()) && $model->save()) {
      Yii::$app->session->addFlash('info', 'Данные пользователя обновлены');
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

      if (strlen($model->name) < 1) {
        $model->name = explode('@', $model->email);
        $model->name = $model->name[0];
      }

      $fav_store = UsersFavorites::find()
          ->where(['user_id' => $id])
          ->all();

      foreach ($fav_store as $k => &$store) {
        $store = $store->store;
        if (!$store) {
          unset ($fav_store[$k]);
        }
      }

      $dataBase = Users::find()
          ->where(['referrer_id' => $id])
          ->orderBy(['uid' => 'desc']);
      $refsActive = clone $dataBase;
      $pagination = new SdPagination($dataBase, false, ['page' => $page, 'limit' => 20, 'asArray' => false]);

      $ref_users = $pagination->data();
      $refsActive = $refsActive
          ->andWhere([
              'or',
              ['>', 'sum_pending', 0],
              ['>', 'sum_confirmed', 0],
              ['>', 'sum_from_ref_pending', 0],
              ['>', 'sum_from_ref_confirmed', 0],
          ])
          ->count();


      if (count($model->errors) > 0) {
        Yii::$app->session->addFlash('err', 'Есть ошибки при сохранении. Проверьте заполнение полей.');
      }

      return $this->render('update.twig', [
          'model' => $model,
          'loyalty_status_list' => $loyalty_status_list,
          'bonus_status_list' => $bonus_status_list,
          'fav_store' => $fav_store,
          'ref_users' => $ref_users,
          "pagination" => $pagination->getPagination('users/admin/update', ['id' => $id]),
          'refs_active' => $refsActive,
          'traffTypeList' => Users::trafficTypeList(),
          'MaskedInput_class' => MaskedInput::class
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
    if (Yii::$app->user->isGuest || !Yii::$app->user->can('UserDelete')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }

    $user_id = Yii::$app->request->post('id');
    if ((int)$user_id == 0) {
      throw new \yii\web\ForbiddenHttpException('Не указан id пользователя.');
      return false;
    }

    $this->findModel($user_id)->delete();
    return true;
  }

  public function actionExport()
  {
      if (Yii::$app->user->isGuest || !Yii::$app->user->can('UserView')) {
          throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
          return false;
      }
      $model = new UsersExport();

      if ($model->load(Yii::$app->request->post()) && $model->validate() && $model->export()) {
          Yii::$app->session->addFlash('info', 'Экспорт пользователей выполнен');
      }
      $data['model'] = $model;
      $get = Yii::$app->request->get();
      $model->register_at_range = isset($get['date_range_added']) ? $get['date_range_added'] : '';
      $data['data_ranger'] = Help::DateRangePicker($model,'register_at_range',['hideInput'=>false]);
      $data['get'] = $get;
      $data['actions'] = Actions::find()->select(['uid', 'name']) ->asArray()->all();

      return $this->render('export.twig', $data);
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
