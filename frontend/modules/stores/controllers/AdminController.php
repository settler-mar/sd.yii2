<?php

namespace frontend\modules\stores\controllers;

use Yii;
use frontend\modules\stores\models\Stores;
use frontend\modules\stores\models\StoresSearch;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;
use yii\web\UploadedFile;
use yii\db\ActiveRecord;

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
        $cpa_list = Yii::$app->db->createCommand('SELECT * FROM cw_cpa')->queryAll();
        $categories = Yii::$app->db->createCommand('SELECT * FROM cw_categories_stores')->queryAll();
         // ddd($cpa);
      /*  $tariffs = ActiveRecord::forTable("cw_cpa")
          ->tableAlias("cwspa")
          ->select(['cwspa.name', 'cwsl.*'])
          ->join("cw_cpa_link", "cwspa.id = cwsl.spa_id", "cwsl")
          ->where("cwsl.stores_id", $store['uid'])
          ->findArray();
        foreach ($tariffs as &$spa) {
          $spa['actions'] = \ORM::forTable("cw_stores_actions")
            ->tableAlias("cwsa")
            ->where("spa_link_id", $spa['id'])
            ->findArray();
          foreach ($spa['actions'] as &$action) {
            $action['tariffs'] = \ORM::forTable("cw_actions_tariffs")
              ->where("id_action", $action['uid'])
              ->findArray();
            foreach ($action['tariffs'] as &$tariff) {
              $tariff['rates'] = \ORM::forTable("cw_tariffs_rates")
                ->where("id_tariff", $tariff['uid'])
                ->findArray();
            }
          }
        }*/

        return $this->render('update', [
            'store' => $model,
            'model' => $model,
          'cpa_list' => $cpa_list,
          'categories' => $categories,
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
