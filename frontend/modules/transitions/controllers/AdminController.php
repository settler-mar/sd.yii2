<?php

namespace frontend\modules\transitions\controllers;

use Yii;
use frontend\modules\transitions\models\UsersVisits;
use app\modules\transitions\models\TransitionsSearch;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;

/**
 * AdminController implements the CRUD actions for UsersVisits model.
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
     * Lists all UsersVisits models.
     * @return mixed
     */
    public function actionIndex()
    {
        $transitions = UsersVisits::find()->with(['user','store'])->all();
      /*$visits = \ORM::forTable("cw_users_visits")
        ->tableAlias("cuv")
        ->select("cuv.*")
        ->select("cwu.email")
        ->select("cwu.uid", "user_id")
        ->select("cws.name", "store_name")
        ->select("cws.uid", "store_uid")
            ->join("cw_stores", "cuv.affiliate_id = cws.affiliate_id", "cws")
            ->join("cw_users", "cuv.user_id = cwu.uid", "cwu")
        ->order_by_desc("cuv.visit_date")
        ->where("cuv.user_id", $user_id)
        ->offset($offset)
        ->limit($limit)
        ->findArray();*/
        return $this->render('index.twig', [
          'transitions'=>$transitions,
        ]);
    }

    /**
     * Displays a single UsersVisits model.
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
     * Creates a new UsersVisits model.
     * If creation is successful, the browser will be redirected to the 'view' page.
     * @return mixed
     */
    public function actionCreate()
    {
        $model = new UsersVisits();

        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            return $this->redirect(['view', 'id' => $model->uid]);
        } else {
            return $this->render('create.twig', [
                'model' => $model,
            ]);
        }
    }

    /**
     * Updates an existing UsersVisits model.
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
     * Deletes an existing UsersVisits model.
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
     * Finds the UsersVisits model based on its primary key value.
     * If the model is not found, a 404 HTTP exception will be thrown.
     * @param integer $id
     * @return UsersVisits the loaded model
     * @throws NotFoundHttpException if the model cannot be found
     */
    protected function findModel($id)
    {
        if (($model = UsersVisits::findOne($id)) !== null) {
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
