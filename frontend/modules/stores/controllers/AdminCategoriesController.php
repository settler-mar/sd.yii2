<?php

namespace frontend\modules\stores\controllers;

use Yii;
use frontend\modules\stores\models\CategoriesStores;
use frontend\modules\stores\models\CategoriesStoresSearch;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;

/**
 * AdminCategoriesController implements the CRUD actions for CategoriesStores model.
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
   * Lists all CategoriesStores models.
   * @return mixed
   */
  public function actionIndex()
  {
    if (Yii::$app->user->isGuest || !Yii::$app->user->can('CategoriesView')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }

    $searchModel = new CategoriesStoresSearch();
    $dataProvider = $searchModel->search(Yii::$app->request->queryParams);

    return $this->render('index.twig', [
      'searchModel' => $searchModel,
      'dataProvider' => $dataProvider,
      'parentsList' => CategoriesStores::getParentsList(['' => 'Любая']),
      'table' => [
        'is_active' => function ($model, $key, $index, $column) {
          return $model->is_active == 1 ? 'Активная' : 'Скрытая';
        },
        'menu_hidden' => function ($model, $key, $index, $column) {
          return $model->menu_hidden == 1 ? 'Скрыто' : 'Нет';
        },
        'show_in_footer' => function ($model, $key, $index, $column) {
          return $model->show_in_footer == 1 ? 'Выводить' : 'Нет';
        },
      ]
    ]);
  }

  /**
   * Creates a new CategoriesStores model.
   * If creation is successful, the browser will be redirected to the 'view' page.
   * @return mixed
   */
  public function actionCreate()
  {
    if (Yii::$app->user->isGuest || !Yii::$app->user->can('CategoriesCreate')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }
    $model = new CategoriesStores();

    if ($model->load(Yii::$app->request->post()) && $model->save()) {
      return $this->redirect(['index']);
    } else {
      return $this->render('create.twig', [
        'model' => $model,
        'parentsList' => CategoriesStores::getParentsList(),
        'iconSelectClass' => \dvixi\IconSelectWidget::className(),
        'iconSelectParam' => $this->getIconsParam(),
      ]);
    }
  }

  /**
   * Updates an existing CategoriesStores model.
   * If update is successful, the browser will be redirected to the 'view' page.
   * @param integer $id
   * @return mixed
   */
  public function actionUpdate($id)
  {
    if (Yii::$app->user->isGuest || !Yii::$app->user->can('CategoriesEdit')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }
    $model = $this->findModel($id);

    if ($model->load(Yii::$app->request->post()) && $model->save()) {
      return $this->redirect(['index']);
    } else {
      return $this->render('update.twig', [
        'model' => $model,
        'parentsList' => CategoriesStores::getParentsList(),
        'iconSelectClass' => \dvixi\IconSelectWidget::className(),
        'iconSelectParam' => $this->getIconsParam(),
      ]);
    }
  }

  /**
   * Deletes an existing CategoriesStores model.
   * If deletion is successful, the browser will be redirected to the 'index' page.
   * @param integer $id
   * @return mixed
   */
  public function actionDelete($id)
  {
    if (Yii::$app->user->isGuest || !Yii::$app->user->can('CategoriesDelete')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }

    $this->findModel($id)->delete();

    return $this->redirect(['index']);
  }

  /**
   * Finds the CategoriesStores model based on its primary key value.
   * If the model is not found, a 404 HTTP exception will be thrown.
   * @param integer $id
   * @return CategoriesStores the loaded model
   * @throws NotFoundHttpException if the model cannot be found
   */
  protected function findModel($id)
  {
    if (($model = CategoriesStores::findOne($id)) !== null) {
      return $model;
    } else {
      throw new NotFoundHttpException('The requested page does not exist.');
    }
  }

  private function getIconsParam()
  {
    $items = Yii::$app->params['dictionary']['map_icons'];
    return [
      'items' => $items,
      'pluginOptions' => [
        'selectedIconWidth' => 22,
        'selectedIconHeight' => 36,
        'selectedBoxPadding' => 1,
        'iconsWidth' => 33,
        'iconsHeight' => 54,
        'boxIconSpace' => 3,
        'vectoralIconNumber' => 4,
        'horizontalIconNumber' => 4
      ],
    ];
  }
}
