<?php

namespace frontend\modules\b2b_users\controllers;

use frontend\modules\b2b_users\models\B2bNewUsers;
use frontend\modules\b2b_users\models\UsersCpa;
use frontend\modules\stores\models\CpaLink;
use frontend\modules\stores\models\Stores;
use Yii;
use frontend\modules\b2b_users\models\B2bUsers;
use frontend\modules\b2b_users\models\B2bUsersSearch;
use yii\bootstrap\Html;
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
    if (Yii::$app->user->isGuest || !Yii::$app->user->can('B2bUsersView')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }

    $searchModel = new B2bUsersSearch();
    $dataProvider = $searchModel->search(Yii::$app->request->queryParams);

    return $this->render('index.twig', [
      'searchModel' => $searchModel,
      'dataProvider' => $dataProvider,
      'actionButtons' => [
        'login' => function ($url, $model) {
          return Html::a('<span class="glyphicon glyphicon-log-in"></span>', $url, [
            'title' => 'Авторизироваться',
            'target' => '_blank'
          ]);
        },
      ]
    ]);
  }

  /**
   * Creates a new B2bUsers model.
   * If creation is successful, the browser will be redirected to the 'view' page.
   * @return mixed
   */
  public function actionCreate()
  {
    if (Yii::$app->user->isGuest || !Yii::$app->user->can('B2bUsersCreate')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }

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
    if (Yii::$app->user->isGuest || !Yii::$app->user->can('B2bUsersEdit')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }

    $model = $this->findModel($id);

    if ($model->load(Yii::$app->request->post()) && $model->save()) {
      return $this->redirect(['index']);
    } else {
      $cpa_link=UsersCpa::find()->where(['user_id' => $id])->all();

      //ddd($cpa_link[0]->cpaStore->store);
      return $this->render('update.twig', [
        'model' => $model,
        'user_id' => $id,
        'cpa_list' => $cpa_link,
      ]);
    }
  }


  public function actionUpdateStore()
  {
    if (Yii::$app->user->isGuest || !Yii::$app->user->can('B2bUsersEdit')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }

    $request = Yii::$app->request;
    if (!$request->isAjax || !$request->isPost) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
    }

    $store = Stores::find()
      ->where(['uid' => $request->post('id')])
      ->one();
    $col = $request->post('name');
    $value = $request->post('value');

    $store->$col = $value;
    $store->save();
  }

  public function actionRemoveStore()
  {
    if (Yii::$app->user->isGuest || !Yii::$app->user->can('B2bUsersEdit')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }

    $request = Yii::$app->request;
    if (!$request->isAjax || !$request->isPost) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
    }

    $cpa=UsersCpa::find()
      ->where(['id'=>$request->post('id')])
      ->one();
    return $cpa && $cpa->delete();
  }

  public function actionLogin($id)
  {
    if (Yii::$app->user->isGuest || !Yii::$app->user->can('B2bUsersLogin')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }

    $user=B2bUsers::find()
      ->where(['id'=>$id])
      ->one();

    if(!$user){
      throw new \yii\web\ForbiddenHttpException('Пользователь не найден.');
      return false;
    }

    $user->temp_key=md5(uniqid(rand(), true)).md5(time());
    $user->save();
    $url=Yii::$app->params['b2b_address'].'/login?key='.$user->temp_key;
    return Yii::$app->getResponse()->redirect($url);
  }

  public function actionAddStore($id)
  {
    if (Yii::$app->user->isGuest || !Yii::$app->user->can('B2bUsersEdit')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }

    $request = Yii::$app->request;
    if(!$request->isAjax){
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
    }

    $error = false;

    if($request->isPost){
      if($request->post('store_id')){
        $store=Stores::find()
          ->where(['uid'=>$request->post('store_id')])
          ->asArray()
          ->one();
        if($store){
          if($request->post('сpa_id')){
            $cpa_list=CpaLink::find()
              ->andWhere([
                'stores_id'=>$store['uid'],
                'id' => $request->post('сpa_id')
              ])
              ->one();
            if(!$cpa_list){
              $error = 'Ошибка выбора CPA';
            }else{
              $l=UsersCpa::find()
                ->where([
                  'cpa_link_id'=>$cpa_list->id,
                  'user_id'=>$id
                ])
                ->one();
              if($l){
                $error = 'Данная CPA от этого магазина уже подключенны.';
              }else{
                $l = new UsersCpa();
                $l->user_id = $id;
                $l->cpa_link_id=$cpa_list->id;
                $l->save();

                return json_encode([
                  'html' => 'CPA успешно подключенна'.
                    '<script>location.href="/admin/b2b_users/update/id:'.$id.'"</script>'
                ]);
              }
            }
          }

          $cpa_list=CpaLink::find()
            ->where(['stores_id'=>$store['uid']])
            ->all();
          return json_encode([
            'html' => $this->renderAjax('add_shop_step2.twig', [
              'user_id' => $id,
              'store' => $store,
              'cpa_list' => $cpa_list,
              'error' => $error,
            ]),
          ]);
        }else{
          $error = 'Магазин не найден.';
        }
      }
    }

    $out = [
      'html' => $this->renderAjax('add_shop_step1.twig', [
        'user_id' => $id,
        'error' => $error,
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
    if (Yii::$app->user->isGuest || !Yii::$app->user->can('B2bUsersDelete')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }

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
