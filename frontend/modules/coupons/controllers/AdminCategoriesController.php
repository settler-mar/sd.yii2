<?php

namespace frontend\modules\coupons\controllers;

use Yii;
use frontend\modules\coupons\models\CategoriesCoupons;
use frontend\modules\coupons\models\CategoriesCouponsSearch;
use frontend\modules\stores\models\CategoriesStores;
use frontend\modules\coupons\models\LgCategoriesCoupons;
use frontend\modules\stores\models\StoresCategoriesToCouponsCategories;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;

/**
 * AdminCategoriesController implements the CRUD actions for CategoriesCoupons model.
 */
class AdminCategoriesController extends Controller
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
   * Lists all CategoriesCoupons models.
   * @return mixed
   */
  public function actionIndex()
  {
    if (Yii::$app->user->isGuest ||  !Yii::$app->user->can('CategoriesView')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }

    $searchModel = new CategoriesCouponsSearch();
    $dataProvider = $searchModel->search(Yii::$app->request->queryParams);

    return $this->render('index.twig', [
      'searchModel' => $searchModel,
      'dataProvider' => $dataProvider,
      'table' => [
        'hide_high_menu' => function ($model, $key, $index, $column) {
          return $model->hide_high_menu == 1 ? 'Скрыто' : 'Нет';
        }
      ]
    ]);
  }

  /**
   * Creates a new CategoriesCoupons model.
   * If creation is successful, the browser will be redirected to the 'view' page.
   * @return mixed
   */
  public function actionCreate()
  {
    if (Yii::$app->user->isGuest ||  !Yii::$app->user->can('CategoriesCreate')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }
    $model = new CategoriesCoupons();

    if ($model->load(Yii::$app->request->post()) && $model->save()) {
      return $this->redirect(['index']);
    } else {
      return $this->render('create.twig', [
        'model' => $model,
      ]);
    }
  }

  /**
   * Updates an existing CategoriesCoupons model.
   * If update is successful, the browser will be redirected to the 'view' page.
   * @param integer $id
   * @return mixed
   */
  public function actionUpdate($id)
  {
    if (Yii::$app->user->isGuest ||  !Yii::$app->user->can('CategoriesEdit')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }

    $model = $this->findModel($id);

    $base_lang=Yii::$app->params['base_lang'];
    $lg_list=Yii::$app->params['language_list'];
    unset($lg_list[$base_lang]);

    $languages = [];
    foreach ($lg_list as $lg_key => $lg_item) {
      $language = LgCategoriesCoupons::find()->where(['category_id' => $id, 'language' => $lg_key])->one();
      if (!$language) {
        $language = new LgCategoriesCoupons();
        $language->category_id = $id;
        $language->language = $lg_key;
      }
      $languages[$lg_key] = [
        'name' => $lg_item,
        'model' => $language,
      ];
    }


    if ($model->load(Yii::$app->request->post()) && $model->save()) {
      //сохранение переводов
      foreach ($languages as $lg_key => $language) {
        if ($language['model']->load(Yii::$app->request->post()) && $language['model']->save()) {
          Yii::$app->session->addFlash('info', $language['name'] . '. Перевод категории обновлен');
        } else {
          Yii::$app->session->addFlash('err', $language['name'] . '. Ошибка обновлении категории');
            $model_stores_categories = [];
            foreach ($model->storesCategories as $category) {
                $model_stores_categories[] = $category->uid;
            }
            header("X-XSS-Protection: 1;");
            return $this->render('update.twig', [
                'model' => $model,
                'model_stores_categories' => $model_stores_categories,
                'stores_categories' => CategoriesStores::find()->where(['parent_id' => 0])->all(),
                'languages' => $languages,
            ]);

        }
      }

      return $this->redirect(['index']);
    } else {
      $model_stores_categories = [];
      foreach ($model->storesCategories as $category) {
          $model_stores_categories[] = $category->uid;
      }
      return $this->render('update.twig', [
        'model' => $model,
        'model_stores_categories' => $model_stores_categories,
        'stores_categories' => CategoriesStores::find()->where(['parent_id' => 0])->all(),
        'languages' => $languages,
      ]);
    }
  }

    /**
     * Изменение связанных категорий шопов
     * @param $id
     * @return bool|\yii\web\Response
     * @throws \yii\web\ForbiddenHttpException
     */
  public function actionUpdateStoresCategories($id)
  {
      if (Yii::$app->user->isGuest ||  !Yii::$app->user->can('CategoriesEdit')) {
          throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
          return false;
      }

      $model = $this->findModel($id);
      $storeCategories = Yii::$app->request->post('stores_category_id');
      StoresCategoriesToCouponsCategories::deleteAll(['coupon_category_id' => $model->uid]);
      foreach ($storeCategories as $storeCategoryId) {
          $newCategory = new StoresCategoriesToCouponsCategories();
          $newCategory->store_category_id = $storeCategoryId;
          $newCategory->coupon_category_id = $model->uid;
          $newCategory->save();
      }

      Yii::$app->session->addFlash('success', ['title'=>'Успешно', 'message' => 'Категории магазинов для категории купонов обновлены']);
      return $this->redirect(['update', 'id' => $model->uid]);
  }

  /**
   * Deletes an existing CategoriesCoupons model.
   * If deletion is successful, the browser will be redirected to the 'index' page.
   * @param integer $id
   * @return mixed
   */
  public function actionDelete($id)
  {
    if (Yii::$app->user->isGuest ||  !Yii::$app->user->can('CategoriesDelete')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }

    $this->findModel($id)->delete();

    return $this->redirect(['index']);
  }

  /**
   * Finds the CategoriesCoupons model based on its primary key value.
   * If the model is not found, a 404 HTTP exception will be thrown.
   * @param integer $id
   * @return CategoriesCoupons the loaded model
   * @throws NotFoundHttpException if the model cannot be found
   */
  protected function findModel($id)
  {
    if (($model = CategoriesCoupons::findOne($id)) !== null) {
      return $model;
    } else {
      throw new NotFoundHttpException('The requested page does not exist.');
    }
  }
}