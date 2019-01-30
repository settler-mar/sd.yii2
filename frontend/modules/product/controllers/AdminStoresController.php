<?php
namespace frontend\modules\product\controllers;

use frontend\modules\product\models\CatalogStores;
use frontend\modules\product\models\CatalogStoresSearch;
use frontend\modules\product\models\ProductsToCategory;
use frontend\modules\product\models\Product;
use frontend\modules\stores\models\Stores;
use frontend\modules\stores\models\CpaLink;
use frontend\modules\stores\models\Cpa;
use Yii;
use yii\filters\VerbFilter;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\helpers\ArrayHelper;

/**
 * AdminStoresController implements the CRUD actions for CatalogStores model.
 */
class AdminStoresController extends Controller
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
   * Lists all CatalogStores models.
   * @return mixed
   */
  public function actionIndex()
  {
    if (Yii::$app->user->isGuest || !Yii::$app->user->can('ProductView')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }
    $storeFilter = ArrayHelper::map(
            Stores::find()
            ->from(Stores::tableName().' s')
            ->innerJoin(CpaLink::tableName(). ' cl', 'cl.stores_id = s.uid')
            ->innerJoin(CatalogStores::tableName(). ' cs', 'cs.cpa_link_id = cl.id')
            ->select(['s.uid', 's.name'])
            ->groupBy(['s.uid', 's.name'])
            ->orderBy(['s.name' => SORT_ASC])
            ->asArray()
            ->all(),
        'uid', 'name'
    );
    $cpaFilter = ArrayHelper::map(Cpa::find()
        ->from(Cpa::tableName().' cpa')
        ->innerJoin(CpaLink::tableName(). ' cl', 'cl.cpa_id = cpa.id')
        ->innerJoin(CatalogStores::tableName(). ' c', 'c.cpa_link_id = cl.id')
        ->orderBy(['cpa.name' => SORT_ASC])
        ->asArray()
        ->all(), 'id', 'name');

    $searchModel = new CatalogStoresSearch();
    $dataProvider = $searchModel->search(Yii::$app->request->queryParams);
    return $this->render('index.twig', [
        'searchModel' => $searchModel,
        'dataProvider' => $dataProvider,
        'tableData' => [
            'active' => function ($model) {
              switch ($model->active) {
                case ($model::CATALOG_STORE_ACTIVE_YES):
                  return 'Активен';
                case ($model::CATALOG_STORE_ACTIVE_NOT):
                  return 'Не активен';
                default:
                  return 'Ожидает подтверждения';
              }
            },
        ],
        'activeFilter' => [
            CatalogStores::CATALOG_STORE_ACTIVE_YES => 'Активен',
            CatalogStores::CATALOG_STORE_ACTIVE_NOT => 'Не активен',
            CatalogStores::CATALOG_STORE_ACTIVE_WAITING => 'Ожидает подтверждения'
        ],
        'storeFilter' => $storeFilter,
        'cpaFilter' => $cpaFilter,
        'clear' => function($url, $model, $key) {
            return '<a title="Delete products" href="/admin-stores/product/clear/id:'.$model->id.'"><i class="fa fa-eraser"></i></a>';
        },
    ]);
  }
  /**
   * Displays a single CatalogStores model.
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
   * Creates a new CatalogStores model.
   * If creation is successful, the browser will be redirected to the 'view' page.
   * @return mixed
   */
//    public function actionCreate()
//    {
//        $model = new CatalogStores();
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
   * Updates an existing CatalogStores model.
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
          'activeFilter' => [
              CatalogStores::CATALOG_STORE_ACTIVE_YES => 'Активен',
              CatalogStores::CATALOG_STORE_ACTIVE_NOT => 'Не активен',
              CatalogStores::CATALOG_STORE_ACTIVE_WAITING => 'Ожидает подтверждения'
          ],
      ]);
    }
  }

    /**
     * удаление товаров каталога
     * @param $id
     * @return bool|\yii\web\Response
     * @throws NotFoundHttpException
     * @throws \yii\db\Exception
     * @throws \yii\web\ForbiddenHttpException
     */
  public function actionClear($id)
  {
      if (Yii::$app->user->isGuest || !Yii::$app->user->can('ProductEdit')) {
          throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
          return false;
      }
      $model = $this->findModel($id);
      if ($model) {
          $sql = 'DELETE FROM `' . ProductsToCategory::tableName() . '` WHERE `product_id` in (' .
              'SELECT `id` FROM `' . Product::tableName() . '` WHERE `catalog_id` = ' . $id . ')';
          Yii::$app->db->createCommand($sql)->execute();
          $sql = 'DELETE FROM `' . Product::tableName() . '` WHERE `catalog_id` = ' . $id;
          $products = Yii::$app->db->createCommand($sql)->execute();
          $model->product_count = 0;
          $model->date_import = null;
          $model->save();
          if ($products) {
              //есть удалённые, нужно убить фото, если есть
              $path = Yii::getAlias('@frontend/web/images/product/' . $model->cpaLink->affiliate_id .
                  '/' . $model->id);
              $deleted = $this->deleteDirectory($path);
          }
          Yii::$app->session->addFlash('info', 'Удалено товаров '.$products.
              (!empty($deleted) ? ', изображений товаров '.$deleted : ''));
      } else {
          Yii::$app->session->addFlash('error', 'Ошибка. Каталог не найден!');
      }
      return $this->redirect(['index']);
  }
  /**
   * Deletes an existing CatalogStores model.
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
   * Finds the CatalogStores model based on its primary key value.
   * If the model is not found, a 404 HTTP exception will be thrown.
   * @param integer $id
   * @return CatalogStores the loaded model
   * @throws NotFoundHttpException if the model cannot be found
   */
  protected function findModel($id)
  {
    if (($model = CatalogStores::findOne($id)) !== null) {
      return $model;
    } else {
      throw new NotFoundHttpException('The requested page does not exist.');
    }
  }

    /**
     * удаление фото для каталога
     * @param $dirname
     * @return int
     */
    protected function deleteDirectory($dirname)
    {
        if (!file_exists($dirname) || !is_dir($dirname)) {
            exit;
        }

        $files = array_diff(scandir($dirname), ['.', '..']);
        $count = count($files);
        foreach ($files as $file) {
            if (!is_dir($dirname . "/" . $file)) {
                unlink($dirname . "/" . $file);
            } else {
                $count += $this->deleteDirectory($dirname . '/' . $file);
            }
        }
        rmdir($dirname);
        return $count;
    }
}