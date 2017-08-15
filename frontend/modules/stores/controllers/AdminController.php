<?php

namespace frontend\modules\stores\controllers;

use app\modules\stores\models\CategoriesStores;
use Yii;
use frontend\modules\stores\models\Stores;
use frontend\modules\stores\models\StoresSearch;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;
use yii\web\UploadedFile;
use yii\db\ActiveRecord;
use app\modules\stores\models\StoresToCategories;
use app\modules\stores\models\Cpa;
use app\modules\stores\models\CpaLink;

/**
 * AdminController implements the CRUD actions for Stores model.
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

    /**
     * Lists all Stores models.
     * @return mixed
     */
    public function actionIndex()
    {
        $searchModel = new StoresSearch();
        $dataProvider = $searchModel->search(Yii::$app->request->queryParams);
        return $this->render('index.twig', [
            'searchModel' => $searchModel,
            'dataProvider' => $dataProvider,
        ]);
    }

    /**
     * Creates a new Stores model.
     * If creation is successful, the browser will be redirected to the 'view' page.
     * @return mixed
     */
    public function actionCreate()
    {
        $model = new Stores();

        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            return $this->redirect(['index']);
        } else {
            return $this->render('create.twig', [
                'model' => $model,
            ]);
        }
    }

    public function actionUpdate($id)
    {
      $model = $this->findModel($id);
      if ($model->load(Yii::$app->request->post())){   // data from request
        $model->save();
        return $this->redirect(['index']);
      }
      else {
        $cpa_list = Cpa::find()->all();
        $categories = CategoriesStores::find()->where(['parent_id'=> $model->uid])->all();
        //$cwsl = \ORM::forTable("cw_cpa_link")
       /* $tariffs = Cpa::find()
          ->joinWith([
            'cpaLink' => function ($query) use($model) {
              $query->onCondition(['stores_id' => $model->uid]);
            },
          ])
          ->joinWith('storesActions')->all();*/
       $tariffs = Cpa::find() -> with([
         'cpaLink' => function($query)use($model){
          $query->andWhere(['stores_id' => $model->uid]);
         },
         'actions.tariffs.rates'])
         ->all();

        return $this->render('update', [
            'store' => $model,
            'model' => $model,
            'cpa_list' => $cpa_list,
            'categories' => $categories,
            'tariffs' => $tariffs,
          ]);
        }
    }

    /**
     * Deletes an existing Stores model.
     * If deletion is successful, the browser will be redirected to the 'index' page.
     * @param integer $id
     * @return mixed
     */
    public function actionDelete($id)
    {
        $store = $this->findModel($id);
          if ($store){
            $store->removeImage(Yii::$app->getBasePath().'\web'.$store->logo);
            $store->delete();
          }

        return $this->redirect(['index']);
    }

    public function actionAjaxInsert(){
      return true;
    }

    /**
     * Finds the Stores model based on its primary key value.
     * If the model is not found, a 404 HTTP exception will be thrown.
     * @param integer $id
     * @return Stores the loaded model
     * @throws NotFoundHttpException if the model cannot be found
     */
    protected function findModel($id)
    {
        if (($model = Stores::findOne($id)) !== null) {
            return $model;
        } else {
            throw new NotFoundHttpException('The requested page does not exist.');
        }
    }

  function beforeAction($action)
  {
    $this->layout = '@app/views/layouts/admin.twig';
    return true;
  }
}
