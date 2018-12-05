<?php

namespace frontend\modules\product\controllers;

use shop\modules\category\models\ProductsCategory;
use shop\modules\category\models\ProductsCategorySearch;
use Yii;
use yii\filters\VerbFilter;
use yii\helpers\ArrayHelper;
use yii\web\Controller;
use yii\web\NotFoundHttpException;

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
    //отключение дебаг панели
    if (class_exists('yii\debug\Module')) {
      Yii::$app->getModule('debug')->instance->allowedIPs = [];
      $this->off(\yii\web\View::EVENT_END_BODY, [\yii\debug\Module::getInstance(), 'renderToolbar']);
    }
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
    //категории
    $cats = ProductsCategory::find()
        ->select(['*'])
        ->where(['synonym' => null])
        ->orderBy(['name' => SORT_ASC])
        ->asArray()
        ->all();

    $synonymFilter = [];
    foreach ($cats as $cat) {
      $synonymFilter[$cat['id']] = ProductsCategory::parentsTree($cat);
    }


    //категории, являющиеся родительскими
    $childs = ProductsCategory::find()->select(['parent'])->where(['is not', 'parent', null]);
    $parents = ProductsCategory::find()
        ->from(ProductsCategory::tableName() . ' pc')
        ->select(['*'])
        ->where(['synonym' => null])
        ->andWhere(['in', 'id', $childs])
        ->orderBy(['name' => SORT_ASC])
        ->asArray()
        ->all();

    $categories = ArrayHelper::index($parents, 'id');


    foreach ($categories as $categoryItem) {
      $parentsTree[$categoryItem['id']] = ProductsCategory::parentsTree($categoryItem, 0, $categories, 2);
    }
    asort($parentsTree);

    //ddd($categoriesFilter);
    /*foreach ($parents as $parent) {
        $parentsTree[$parent['id']] = ProductsCategory::parentsTree($parent);
    }*/

    return $this->render('index.twig', [
        'searchModel' => $searchModel,
        'dataProvider' => $dataProvider,
        'tableData' => [
            'parents' => function ($model) {
              //return $model->parent;
              return ProductsCategory::parentsTree($model->parent, 2);
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
              $out = '<a href="/admin-category/product/update/id:' . $model->id . '">' .
                  '<span class="' . ProductsCategory::activeClass($model->active) . '">' . $model->name . '</span></a>';
              $synonyms = [];
              /*if ($model->synonyms) {
                  foreach ($model->synonyms as $synonym) {
                      $synonyms[] = '<a title="Синоним" ' .
                          ' href="/admin-category/product/update/id:'.$synonym->id.'">' .
                          '<span class="'.ProductsCategory::activeClass($synonym->active).'">' .
                          $synonym->name.'</span></a>';
                  }
                  $out .= '('.implode(';', $synonyms).')';
              }*/
              return $out;
            }
        ],
        'parents' => ['0' => 'Нет'] + $parentsTree,
        'synonymFilter' => ['-1' => 'Нет', '0' => 'Любое значение'] + $synonymFilter,
        'activeFilter' => $this->activeFilter(),
    ]);
  }

  /**
   * Creates a new ProductsCategory model.
   * If creation is successful, the browser will be redirected to the 'view' page.
   * @return mixed
   */
  public function actionCreate()
  {
    $model = new ProductsCategory();

    if ($model->load(Yii::$app->request->post()) && $model->save()) {
      return $this->redirect(['index']);
    } else {
      return $this->render('create.twig', [
          'model' => $model,
          'activeFilter' => $this->activeFilter(),
          'data' => ProductsCategory::categoriesJson(),
      ]);
    }
  }

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
      return $this->render('update.twig', [
          'model' => $model,
          'activeFilter' => $this->activeFilter(),
          'data' => ProductsCategory::categoriesJson($id),
      ]);
    }
  }

  /**
   * @return bool|string
   * @throws NotFoundHttpException
   * @throws \yii\web\ForbiddenHttpException
   */
  public function actionUpdateAll()
  {
    if (Yii::$app->user->isGuest || !Yii::$app->user->can('ProductEdit')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }
    $request = Yii::$app->request;
    if (!$request->isAjax) {
      throw new NotFoundHttpException();
    }
    $ids = $request->post('id');
    $active = $request->post('active');
    $data = [];
    if ($active !== '') {
      $data['active'] = in_array($active, [
          ProductsCategory::PRODUCT_CATEGORY_ACTIVE_NOT,
          ProductsCategory::PRODUCT_CATEGORY_ACTIVE_WAITING,
          ProductsCategory::PRODUCT_CATEGORY_ACTIVE_YES
      ]) ? $active : ProductsCategory::PRODUCT_CATEGORY_ACTIVE_WAITING;
    }
    $parent = $request->post('parent');
    if ($parent !== '') {
      $data['parent'] = (int)$parent > 0 ? (int)$parent : null;
    }
    $synonym = $request->post('synonym');
    if ($synonym !== '') {
      $data['synonym'] = (int)$synonym > 0 ? (int)$synonym : null;
    }

    $result = !empty($data) ? ProductsCategory::updateAll($data, ['id' => $ids]) : 0;

    return json_encode(['error' => $result < 1]);
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
    return [
        ProductsCategory::PRODUCT_CATEGORY_ACTIVE_YES => 'Активна',
        ProductsCategory::PRODUCT_CATEGORY_ACTIVE_NOT => 'Не активна',
        ProductsCategory::PRODUCT_CATEGORY_ACTIVE_WAITING => 'Ожидает подтверждения'
    ];
  }

}