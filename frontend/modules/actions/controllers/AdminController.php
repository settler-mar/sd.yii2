<?php

namespace frontend\modules\actions\controllers;

use Yii;
use frontend\modules\actions\models\Actions;
use frontend\modules\actions\models\ActionsSearch;
use frontend\modules\actions\models\ActionsConditions;
use frontend\modules\actions\models\ActionsActions;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;
use yii\helpers\ArrayHelper;
use frontend\modules\promo\models\Promo as DbPromo;

/**
 * AdminController implements the CRUD actions for Actions model.
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
                    'deleteCondition' => ['post'],
                    'deleteAction' => ['post'],
                ],
            ],
        ];
    }

    public function beforeAction($action)
    {
        if (!Yii::$app->user->identity->is_admin) {
            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
        }
        $this->layout = '@app/views/layouts/admin.twig';
        return true;
    }

    /**
     * Lists all Actions models.
     * @return mixed
     */
    public function actionIndex()
    {
        $searchModel = new ActionsSearch();
        $dataProvider = $searchModel->search(Yii::$app->request->queryParams);

        return $this->render('index.twig', [
            'searchModel' => $searchModel,
            'dataProvider' => $dataProvider,
        ]);
    }

    /**
     * Displays a single Actions model.
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
     * Creates a new Actions model.
     * If creation is successful, the browser will be redirected to the 'view' page.
     * @return mixed
     */
    public function actionCreate()
    {
        $model = new Actions();
        $promos = ArrayHelper::map(DbPromo::find()->all(), 'uid', 'title');

        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            return $this->redirect(['index']);
        } else {
            return $this->render('create.twig', [
                'model' => $model,
                'promos' => $promos,
            ]);
        }
    }

    /**
     * Updates an existing Actions model.
     * If update is successful, the browser will be redirected to the 'view' page.
     * @param integer $id
     * @return mixed
     */
    public function actionUpdate($id)
    {
        $model = $this->findModel($id);
        $promos = ArrayHelper::map(DbPromo::find()->all(), 'uid', 'title');

        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            return $this->redirect(['index']);
        } else {
            return $this->render('update.twig', [
                'model' => $model,
                'promos' => $promos,
            ]);
        }
    }

    /**
     * Deletes an existing Actions model.
     * If deletion is successful, the browser will be redirected to the 'index' page.
     * @param integer $id
     * @return mixed
     */
    public function actionDelete($id)
    {
        $this->findModel($id)->delete();

        return $this->redirect(['index']);
    }

    /**добавить условие
     * @param $id
     * @return string|\yii\web\Response
     */
    public function actionAddCondition($id)
    {
        $model = new ActionsConditions();
        $model->action_id = $id;

        $dictionary = Yii::$app->params['dictionary'];
        $loyaltyStatuses = isset($dictionary['loyalty_status']) ? $dictionary['loyalty_status'] : [];
        $bonusStatuses = isset($dictionary['bonus_status']) ? $dictionary['bonus_status'] : [];
        $loyaltyStatuses = array_map(function ($item, $key) {
            return $item['display_name'].'('.$key.')';
        }, $loyaltyStatuses, array_keys($loyaltyStatuses));
        $bonusStatuses = array_map(function ($item, $key) {
            return $item['name'].' ('.$key.')';
        }, $bonusStatuses, array_keys($bonusStatuses));

        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            return $this->redirect(['update', 'id' => $id]);
        } else {
            return $this->render('formCondition.twig', [
                'model' => $model,
                'loyalty_statuses' => $loyaltyStatuses,
                'bonus_statuses' => $bonusStatuses,
            ]);
        }
    }

    /**
     * изменить условие
     * @param $id
     * @return string|\yii\web\Response
     * @throws NotFoundHttpException
     */
    public function actionUpdateCondition($id)
    {
        $model = $this->findCondition($id);


        $dictionary = Yii::$app->params['dictionary'];
        $loyaltyStatuses = isset($dictionary['loyalty_status']) ? $dictionary['loyalty_status'] : [];
        $bonusStatuses = isset($dictionary['bonus_status']) ? $dictionary['bonus_status'] : [];
        $loyaltyStatuses = array_map(function ($item, $key) {
            return $item['display_name'].'('.$key.')';
        }, $loyaltyStatuses, array_keys($loyaltyStatuses));
        $bonusStatuses = array_map(function ($item, $key) {
            return $item['name'].' ('.$key.')';
        }, $bonusStatuses, array_keys($bonusStatuses));

        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            return $this->redirect(['update', 'id'=>$model->action_id]);
        } else {
            return $this->render('formCondition.twig', [
                'model' => $model,
                'loyalty_statuses' => $loyaltyStatuses,
                'bonus_statuses' => $bonusStatuses,
            ]);
        }
    }

    /** удалить условие
     * @param $id
     * @return \yii\web\Response
     * @throws NotFoundHttpException
     * @throws \Throwable
     * @throws \yii\db\StaleObjectException
     */
    public function actionDeleteCondition($id)
    {
        $model = $this->findCondition($id);
        $actionId = $model->action_id;
        $model->delete();

        return $this->redirect(['update', 'id' => $actionId]);
    }

    /**
     * создать действие
     * @param $id
     * @return string|\yii\web\Response
     */
    public function actionAddAction($id)
    {
        $model = new ActionsActions();
        $model->action_id = $id;

        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            return $this->redirect(['update', 'id' => $id]);
        } else {
            return $this->render('formActions.twig', [
                'model' => $model,
            ]);
        }
    }

    /**
     * изменить действие
     * @param $id
     * @return string|\yii\web\Response
     * @throws NotFoundHttpException
     */
    public function actionUpdateAction($id)
    {
        $model = $this->findAction($id);

        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            return $this->redirect(['update', 'id'=>$model->action_id]);
        } else {
            return $this->render('formActions.twig', [
                'model' => $model,
            ]);
        }
    }

    /**
     * удалить действие
     * @param $id
     * @return \yii\web\Response
     * @throws NotFoundHttpException
     * @throws \Throwable
     * @throws \yii\db\StaleObjectException
     */
    public function actionDeleteAction($id)
    {
        $model = $this->findAction($id);
        $actionId = $model->action_id;
        $model->delete();

        return $this->redirect(['update', 'id' => $actionId]);
    }

    /**
     * Finds the Actions model based on its primary key value.
     * If the model is not found, a 404 HTTP exception will be thrown.
     * @param integer $id
     * @return Actions the loaded model
     * @throws NotFoundHttpException if the model cannot be found
     */
    protected function findModel($id)
    {
        if (($model = Actions::findOne($id)) !== null) {
            return $model;
        } else {
            throw new NotFoundHttpException('The requested page does not exist.');
        }
    }

    /**
     * @param $id
     * @return ActionsConditions|null
     * @throws NotFoundHttpException
     */
    protected function findCondition($id)
    {
        if (($model = ActionsConditions::findOne($id)) !== null) {
            return $model;
        } else {
            throw new NotFoundHttpException('The requested page does not exist.');
        }
    }
    /**
     * @param $id
     * @return ActionsActions|null
     * @throws NotFoundHttpException
     */
    protected function findAction($id)
    {
        if (($model = ActionsActions::findOne($id)) !== null) {
            return $model;
        } else {
            throw new NotFoundHttpException('The requested page does not exist.');
        }
    }


}
