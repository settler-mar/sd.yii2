<?php
namespace frontend\modules\product\controllers;
use Yii;
use shop\modules\category\models\ProductsCategory;
use shop\modules\category\models\ProductsCategorySearch;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;
use yii\helpers\ArrayHelper;
/**
 * AdminCategoryController implements the CRUD actions for ProductsCategory model.
 */
class AdminCategoryController extends Controller
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
   * Lists all ProductsCategory models.
   * @return mixed
   */
    public function actionIndex()
    {
        if (Yii::$app->user->isGuest || !Yii::$app->user->can('ProductView')) {
            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
            return false;
        }
        $searchModel = new ProductsCategorySearch();
        $dataProvider = $searchModel->search(Yii::$app->request->queryParams);
        $parents = ArrayHelper::map(
            ProductsCategory::find()->select(['id', 'name'])->orderBy(['name' => SORT_ASC])->asArray()->all(),
            'id',
            'name'
        );
        return $this->render('index.twig', [
            'searchModel' => $searchModel,
            'dataProvider' => $dataProvider,
            'tableData' => [
                'parents' => function ($model) {
                    $out = '';
                    $parents = ProductsCategory::parents([$model]);
                    if (count($parents) > 1) {
                        for ($i = count($parents) - 1; $i > 0; $i--) {
                            $out .= '<a href="admin-category/product/update/id:' . $parents[$i]->id . '">';
                            switch ($parents[$i]->active) {
                                case (ProductsCategory::PRODUCT_CATEGORY_ACTIVE_NOT):
                                    $out .= '<span class="status_1">';
                                    break;
                                case (ProductsCategory::PRODUCT_CATEGORY_ACTIVE_YES):
                                    $out .= '<span class="status_2">';
                                    break;
                                default:
                                    $out .= '<span class="status_0">';
                            }
                            $out .= $parents[$i]->name;
                            $out .= '</span></a>/';
                        }
                    }
                    return $out;
                },
                'synonym' => function ($model) {
                    return isset($model->synonymCategory->name) ? $model->synonymCategory->name : '';
                },
                'active' => function ($model) {
                    switch ($model->active) {
                        case (ProductsCategory::PRODUCT_CATEGORY_ACTIVE_NOT):
                            return '<span class="status_1"><span class="fa fa-times"></span>&nbsp;Неактивен</span>';
                        case (ProductsCategory::PRODUCT_CATEGORY_ACTIVE_YES):
                            return '<span class="status_2"><span class="fa fa-check"></span>&nbsp;Активен</span>';
                        default:
                            return '<span class="status_0"><span class="fa fa-clock-o"></span>&nbsp;Ожидает проверки</span>';
                    }
                },
                'name' => function ($model) {
                    $out = '<span';
                    if ($model->synonyms) {
                        $out .= ' style="cursor:pointer" ';
                        $out .= ' title="Синонимы: ' . implode('/', array_column($model->synonyms, 'name')) . '" ';
                    }
//                    switch ($model->active) {
//                        case (ProductsCategory::PRODUCT_CATEGORY_ACTIVE_NOT):
//                            $out .= ' class="status_1"';
//                            break;
//                        case (ProductsCategory::PRODUCT_CATEGORY_ACTIVE_YES):
//                            $out .= ' class="status_2"';
//                            break;
//                        default:
//                            $out .= ' class="status_0"';
//                    }
                    $out .= '>' . $model->name;
                    $out .= '</span>';
                    return $out;
                }
            ],
            'parents' => ['0' => 'Нет'] + $parents,
            'synonymFilter' => ['-1' => 'Нет', '0' => 'Любое значение'] + $parents,
            'activeFilter' => $this->activeFilter(),
        ]);
  }
  /**
   * Displays a single ProductsCategory model.
   * @param integer $id
   * @return mixed
   */
//    public function actionView($id)
//    {
//        return $this->render('view.twig', [
//            'model' => $this->findModel($id),
//        ]);
//    }
  /**
   * Creates a new ProductsCategory model.
   * If creation is successful, the browser will be redirected to the 'view' page.
   * @return mixed
   */
//    public function actionCreate()
//    {
//        $model = new ProductsCategory();
//
//        if ($model->load(Yii::$app->request->post()) && $model->save()) {
//            return $this->redirect(['view', 'id' => $model->id]);
//        } else {
//            return $this->render('create.twig', [
//                'model' => $model,
//            ]);
//        }
//    }
  /**
   * Updates an existing ProductsCategory model.
   * If update is successful, the browser will be redirected to the 'view' page.
   * @param integer $id
   * @return mixed
   */
  public function actionUpdate($id)
  {
    if (Yii::$app->user->isGuest || !Yii::$app->user->can('ProductEdit')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }
    $model = $this->findModel($id);
    if ($model->load(Yii::$app->request->post()) && $model->save()) {
      return $this->redirect(['index']);
    } else {
      $all = ArrayHelper::map(
          ProductsCategory::find()->where(['<>', 'id', $id])->select(['id', 'name'])->orderBy(['name' => SORT_ASC])->asArray()->all(),
          'id',
          'name'
      );
      return $this->render('update.twig', [
          'model' => $model,
          'all' => $all,
          'activeFilter' => $this->activeFilter(),
      ]);
    }
  }
  /**
   * Deletes an existing ProductsCategory model.
   * If deletion is successful, the browser will be redirected to the 'index' page.
   * @param integer $id
   * @return mixed
   */
//    public function actionDelete($id)
//    {
//        $this->findModel($id)->delete();
//
//        return $this->redirect(['index']);
//    }
  /**
   * Finds the ProductsCategory model based on its primary key value.
   * If the model is not found, a 404 HTTP exception will be thrown.
   * @param integer $id
   * @return ProductsCategory the loaded model
   * @throws NotFoundHttpException if the model cannot be found
   */
  protected function findModel($id)
  {
    if (($model = ProductsCategory::findOne($id)) !== null) {
      return $model;
    } else {
      throw new NotFoundHttpException('The requested page does not exist.');
    }
  }
  protected function activeFilter()
  {
    return  [
        ProductsCategory::PRODUCT_CATEGORY_ACTIVE_YES => 'Активна',
        ProductsCategory::PRODUCT_CATEGORY_ACTIVE_NOT => 'Не активна',
        ProductsCategory::PRODUCT_CATEGORY_ACTIVE_WAITING => 'Ожидает подтверждения'
    ];
  }
}