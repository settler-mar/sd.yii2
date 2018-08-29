<?php

namespace frontend\modules\coupons\controllers;

use common\components\Help;
use frontend\modules\coupons\models\CategoriesCoupons;
use frontend\modules\coupons\models\Coupons;
use frontend\modules\coupons\models\CouponsSearch;
use frontend\modules\coupons\models\CouponsToCategories;
use frontend\modules\stores\models\Cpa;
use Yii;
use yii\filters\VerbFilter;
use yii\helpers\ArrayHelper;
use yii\web\Controller;
use yii\web\NotFoundHttpException;

/**
 * AdminController implements the CRUD actions for Coupons model.
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
   * Lists all Coupons models.
   * @return mixed
   */
  public function actionIndex()
  {
    if (Yii::$app->user->isGuest || !Yii::$app->user->can('CouponsView')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }
    $searchModel = new CouponsSearch();
    $dataProvider = $searchModel->search(Yii::$app->request->queryParams);

    $cpaNames = ArrayHelper::map(Cpa::find()
        ->select(['cw_cpa.id', 'cw_cpa.name'])
        ->innerJoin('cw_coupons', 'cw_coupons.cpa_id = cw_cpa.id')
        ->groupBy(['id', 'name'])
        ->asArray()->all(), 'id', 'name');
    $stat_cpa_all = Cpa::find()
      ->from(Cpa::tableName(). ' cwc')
      ->leftJoin(Coupons::tableName(). ' coupons', 'cwc.id = coupons.cpa_id')
      ->select(['cwc.id', 'cwc.name', 'count(coupons.uid) as count'])
      ->groupBy(['cwc.id', 'cwc.name'])
      ->orderBy('cwc.name')
      ->having(['>', 'count', 0])
      ->asArray()
      ->all();
    foreach ($stat_cpa_all as $cpa) {
          $stat_cpa[$cpa['id']] = $cpa;
    }
    $stat_cpa_active = Cpa::find()
          ->from(Cpa::tableName(). ' cwc')
          ->leftJoin(Coupons::tableName(). ' coupons', 'cwc.id = coupons.cpa_id ')
          ->select(['cwc.id', 'cwc.name', 'count(coupons.uid) as count'])
          ->groupBy(['cwc.id', 'cwc.name'])
          ->where(['>=', 'coupons.date_end', date('Y-m-d H:i:s')])
          ->having(['>', 'count', 0])
          ->asArray()
          ->all();
    foreach ($stat_cpa_active as $cpa) {
        $stat_cpa[$cpa['id']]['active'] = $cpa['count'];
    }

    return $this->render('index.twig', [
        'searchModel' => $searchModel,
        'dataProvider' => $dataProvider,
        'startDataRanger' => Help::DateRangePicker($searchModel, 'date_start_range', ['hideInput' => false]),
        'endDataRanger' => Help::DateRangePicker($searchModel, 'date_end_range', ['hideInput' => false]),
        'tableData' => [
            'reviewsCount' => function ($model) {
              $count = count($model->reviews);
              if ($count) {
                return '<a href="/admin/reviews?ReviewsSearch%5Bcoupon_id%5D=' . $model->uid . '" target="_blank">' . $count . '</a>';
              }
              return 0;
            },
            'name' => function($model) {
                return '<a href="/coupons/' . $model->store->route.'/'. $model->uid . '" target="_blank">' . $model->name . '</a>';
            }
        ],
        'cpaNames' => $cpaNames,
        'active_count' => Coupons::find()->where(['>=', 'date_end', date('Y-m-d H:i:s')])->count(),
        'stat_cpa' => $stat_cpa,
        'total' => Coupons::find()->count(),
    ]);
  }

  /**
   * Updates an existing Coupons model.
   * If update is successful, the browser will be redirected to the 'view' page.
   * @param integer $id
   * @return mixed
   */
  public function actionUpdate($id)
  {
    if (Yii::$app->user->isGuest || !Yii::$app->user->can('CouponsEdit')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }
    $model = $this->findModel($id);
    $validator = new \yii\validators\NumberValidator();
    $validatorEach = new \yii\validators\EachValidator(['rule' => ['integer']]);
    $request = Yii::$app->request;

    if ($request->post('type') != 'update_categories' &&
        $model->load($request->post()) && $model->save()) {
      //изменение модели
      return $this->redirect(['index']);
    } elseif ($request->post('type') == 'update_categories' &&
        $request->validateCsrfToken()
        && $request->post('coupon_id') && $validator->validate($request->post('coupon_id'))
        && $request->post('category_id') && is_array($request->post('category_id'))
        && $validatorEach->validate($request->post('category_id'))
    ) {
      //изменение категорий купона
      CouponsToCategories::deleteAll(['coupon_id' => $request->post('coupon_id')]);
      foreach ($request->post('category_id') as $categoryId) {
        $categoryCoupons = new CouponsToCategories;
        $categoryCoupons->coupon_id = $request->post('coupon_id');
        $categoryCoupons->category_id = $categoryId;
        $categoryCoupons->save();
      }
      return $this->redirect(['index']);
    } else {
      //вывод формы
      $categories = CategoriesCoupons::find()
          ->orderBy('name ASC')
          ->asArray()
          ->all();
      return $this->render('update.twig', [
          'coupon' => $model,
          'coupon_categories' => array_column($model->categories, 'uid'),
          'categories' => $categories,
          'languages' => Yii::$app->languageDetector->getLanguages(),
      ]);
    }
  }

  /**
   * Deletes an existing Coupons model.
   * If deletion is successful, the browser will be redirected to the 'index' page.
   * @param integer $id
   * @return mixed
   */
  public function actionDelete($id)
  {
    if (Yii::$app->user->isGuest || !Yii::$app->user->can('CouponsDelete')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }
    //$this->findModel($id)->delete();
    $model = $this->findModel($id);
    $model->date_end = date('Y-m-d', time());
    $model->save();

    return $this->redirect(['index']);
  }

  /**
   * Finds the Coupons model based on its primary key value.
   * If the model is not found, a 404 HTTP exception will be thrown.
   * @param integer $id
   * @return Coupons the loaded model
   * @throws NotFoundHttpException if the model cannot be found
   */
  protected function findModel($id)
  {
    if (($model = Coupons::findOne($id)) !== null) {
      return $model;
    } else {
      throw new NotFoundHttpException('The requested page does not exist.');
    }
  }
}
