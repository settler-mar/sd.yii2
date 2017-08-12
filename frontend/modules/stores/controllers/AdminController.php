<?php

namespace frontend\modules\stores\controllers;

use Yii;
use frontend\modules\stores\models\Stores;
use frontend\modules\stores\models\StoresSearch;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;

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
        return $this->render('update', [
            'store' => $model,
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
        $this->findModel($id)->delete();

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
