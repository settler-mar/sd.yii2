<?php

namespace frontend\modules\reviews\controllers;

use Yii;
use frontend\modules\reviews\models\Reviews;
use frontend\modules\reviews\models\ReviewsSearch;
use frontend\modules\coupons\models\Coupons;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;

/**
 * AdminController implements the CRUD actions for Reviews model.
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
   * Lists all Reviews models.
   * @return mixed
   */
  public function actionIndex()
  {
    if (Yii::$app->user->isGuest ||  !Yii::$app->user->can('ReviewsView')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }

    $searchModel = new ReviewsSearch();
    $dataProvider = $searchModel->search(Yii::$app->request->queryParams);

    return $this->render('index.twig', [
      'searchModel' => $searchModel,
      'dataProvider' => $dataProvider,
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
        'rating' => function ($model, $key, $index, $column) {
          $out='';
          for($i=0;$i<5;$i++){
            if($i<$model->rating) {
              $out .= '<span class="fa fa-star"></span>';
            }else{
              $out .= '<span class="fa fa-star-o"></span>';
            }
          }
          return $out;
        },
        'store'=>function ($model, $key, $index, $column) {
          $store = $model->getStore();
          if($model->coupon_id > 0){
            return 'Купон';
          } elseif (!$store) {
            return 'Общий';
          }
          $out = '<a href="/admin/stores/update?id=';
          $out .= $store->uid;
          $out .= '" target=_blank rel="nofollow noopener">';
          $out .= $store->name;
          $out .= ' (';
          $out .= $store->uid;
          $out .= ')</a>';
          return $out;
        },
        'coupon' => function($model) {
            $coupon =  $model->coupon_id > 0 ? Coupons::findOne($model->coupon_id) : null;
            $store = $coupon ? $coupon->store : false;
            if (!$coupon) {
                return 'Нет';
            }
            $out = $coupon ? '<a href="/admin/coupons/update?id='.$coupon->uid .
                '" target=_blank rel="nofollow noopener">Купон '.
                '('. $coupon->uid .')</a>' : '';
            $out .= ($store ? ' для магазина<br><a href="/admin/stores/update?id='.$store->uid .
                '" target=_blank rel="nofollow noopener">' . $store->name . ' ('. $store->uid .
                ')</a>' : '');
            return $out;
        },
        'is_active' => function ($model, $key, $index, $column) {
          return $model->is_active==0?"Скрыт":"Активен";
        },
      )
    ]);
  }

  /**
   * Creates a new Reviews model.
   * If creation is successful, the browser will be redirected to the 'view' page.
   * @return mixed
   */
  public function actionCreate()
  {
    if (Yii::$app->user->isGuest ||  !Yii::$app->user->can('ReviewsCreate')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }

    $model = new Reviews();

    if ($model->load(Yii::$app->request->post()) && $model->save()) {
      return $this->redirect(['edit', 'id' => $model->uid]);
    } else {
      return $this->render('create.twig', [
        'model' => $model,
      ]);
    }
  }

  /**
   * Updates an existing Reviews model.
   * If update is successful, the browser will be redirected to the 'view' page.
   * @param integer $id
   * @return mixed
   */
  public function actionUpdate($id)
  {
    if (Yii::$app->user->isGuest ||  !Yii::$app->user->can('ReviewsEdit')) {
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
   * Deletes an existing Reviews model.
   * If deletion is successful, the browser will be redirected to the 'index' page.
   * @param integer $id
   * @return mixed
   */
  public function actionDelete($id)
  {
    if (Yii::$app->user->isGuest ||  !Yii::$app->user->can('ReviewsDelete')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }

    $this->findModel($id)->delete();

    return $this->redirect(['index']);
  }

  /**
   * Finds the Reviews model based on its primary key value.
   * If the model is not found, a 404 HTTP exception will be thrown.
   * @param integer $id
   * @return Reviews the loaded model
   * @throws NotFoundHttpException if the model cannot be found
   */
  protected function findModel($id)
  {
    if (($model = Reviews::findOne($id)) !== null) {
      return $model;
    } else {
      throw new NotFoundHttpException('The requested page does not exist.');
    }
  }
}
