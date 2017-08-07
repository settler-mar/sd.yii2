<?php

namespace app\modules\constants\controllers;

use Yii;
use app\modules\constants\models\Constants;
use app\modules\constants\models\ConstantsSearch;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;

/**
 * AdminController implements the CRUD actions for Constants model.
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
     * Lists all Constants models.
     * @return mixed
     */
    public function actionIndex()
    {
        if (isset($_GET['id'])) {
          $model = $this->findModel($_GET['id']);
          if ($model->load(Yii::$app->request->post()) && $model->save()) {
            return $this->redirect(['admin/constants']);
          } else {
            return $this->render('update.twig', [
              'model' => $model,
            ]);
          }
        }
        $searchModel = new ConstantsSearch();
        $dataProvider = $searchModel->search(Yii::$app->request->queryParams);

        return $this->render('index.twig', [
            'searchModel' => $searchModel,
            'dataProvider' => $dataProvider,
        ]);
    }

    /**
     * Displays a single Constants model.
     * @param integer $id
     * @return mixed
     */
    public function actionView($id)
    {
        return $this->render('view.twig', [
            'model' => $this->findModel($id),
        ]);
    }

    /**
     * Updates an existing Constants model.
     * If update is successful, the browser will be redirected to the 'view' page.
     * @param integer $id
     * @return mixed
     */
    public function actionUpdate($id)
    {
        $model = $this->findModel($id);

        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            return $this->redirect(['view', 'id' => $model->uid]);
        } else {
            return $this->render('update.twig', [
                'model' => $model,
            ]);
        }
    }

    /**
     * Deletes an existing Constants model.
     * If deletion is successful, the browser will be redirected to the 'index' page.
     * @param integer $id
     * @return mixed
     */
    public function actionDelete($id)
    {
        $this->findModel($id)->delete();

        return $this->redirect(['index']);
    }

    /**
     * Finds the Constants model based on its primary key value.
     * If the model is not found, a 404 HTTP exception will be thrown.
     * @param integer $id
     * @return Constants the loaded model
     * @throws NotFoundHttpException if the model cannot be found
     */
    protected function findModel($id)
    {
        if (($model = Constants::findOne($id)) !== null) {
            return $model;
        } else {
            throw new NotFoundHttpException('The requested page does not exist.');
        }
    }
}
