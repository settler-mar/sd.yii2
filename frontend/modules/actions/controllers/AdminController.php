<?php

namespace frontend\modules\actions\controllers;

use Yii;
use frontend\modules\actions\models\Actions;
use frontend\modules\actions\models\ActionsSearch;
use frontend\modules\actions\models\ActionsConditions;
use frontend\modules\actions\models\ActionsActions;
use frontend\modules\meta\models\Meta;
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
        $this->layout = '@app/views/layouts/admin.twig';
        return true;
    }

    /**
     * Lists all Actions models.
     * @return mixed
     */
    public function actionIndex()
    {
        if (Yii::$app->user->isGuest || !Yii::$app->user->can('ActionsView')) {
            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
            return false;
        }

        $searchModel = new ActionsSearch();
        $dataProvider = $searchModel->search(Yii::$app->request->queryParams);

        return $this->render('index.twig', [
            'searchModel' => $searchModel,
            'dataProvider' => $dataProvider,
            'tableData' => [
                'joined' => function ($model) {
                    return $model['joined'] > 0 ?
                        '<a href="/admin/users?joined_to='.$model['uid'].'">'.$model['joined'].'</a>' :
                        $model['joined'];
                },
                'completed' => function ($model) {
                    return $model['completed'] > 0 ?
                        '<a href="/admin/users?completed_to='.$model['uid'].'">'.$model['completed'].'</a>' :
                        $model['completed'];
                },
            ],
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
        if (Yii::$app->user->isGuest || !Yii::$app->user->can('ActionsCreate')) {
            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
            return false;
        }

        $model = new Actions();
        $promos = ArrayHelper::map(DbPromo::find()->all(), 'uid', 'title');
        $pages = ArrayHelper::map(Meta::find()
            ->select(['page'])
            ->where(['not like', 'page', '*'])
            ->all(), 'page', 'page');

        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            return $this->redirect(['update', 'id'=>$model->uid]);
        } else {
            return $this->render('create.twig', [
                'model' => $model,
                'promos' => $promos,
                'pages' => $pages,
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
        if (Yii::$app->user->isGuest || !Yii::$app->user->can('ActionsEdit')) {
            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
            return false;
        }

        $model = $this->findModel($id);
        $promos = ArrayHelper::map(DbPromo::find()->all(), 'uid', 'title');
        $pages = ArrayHelper::map(Meta::find()
            ->select(['page'])
            ->where(['not like', 'page', '*'])
            ->all(), 'page', 'page');

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
            return $this->redirect(['index']);
        } else {
            return $this->render('update.twig', [
                'model' => $model,
                'promos' => $promos,
                'pages' => $pages,
                'loyalty_statuses' => $loyaltyStatuses,
                'bonus_statuses' => $bonusStatuses,
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
        if (Yii::$app->user->isGuest || !Yii::$app->user->can('ActionsDelete')) {
            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
            return false;
        }

        $this->findModel($id)->delete();

        return $this->redirect(['index']);
    }

    /**добавить условие
     * @param $id
     * @return string|\yii\web\Response
     */
    public function actionAddCondition($id)
    {
        if (Yii::$app->user->isGuest || !Yii::$app->user->can('ActionsEdit')) {
            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
            return false;
        }

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
        if (Yii::$app->user->isGuest || !Yii::$app->user->can('ActionsEdit')) {
            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
            return false;
        }

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
        if (Yii::$app->user->isGuest || !Yii::$app->user->can('ActionsEdit')) {
            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
            return false;
        }

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
        if (Yii::$app->user->isGuest || !Yii::$app->user->can('ActionsEdit')) {
            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
            return false;
        }

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
        if (Yii::$app->user->isGuest || !Yii::$app->user->can('ActionsEdit')) {
            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
            return false;
        }

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
        if (Yii::$app->user->isGuest || !Yii::$app->user->can('ActionsEdit')) {
            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
            return false;
        }

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
