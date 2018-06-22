<?php

namespace frontend\modules\promo\controllers;

use yii;
use frontend\modules\promo\models\Promo;
use frontend\modules\promo\models\SearchPromo;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;

/**
 * AdminController implements the CRUD actions for Promo model.
 */
class AdminController extends Controller
{
    public function behaviors()
    {
        return [
            'verbs' => [
                'class' => VerbFilter::className(),
                'actions' => [
                    'delete' => ['POST'],
                ],
            ],
        ];
    }

    public function beforeAction($action)
    {
//        if (!Yii::$app->user->identity->is_admin) {
//            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
//        }
        $this->layout = '@app/views/layouts/admin.twig';
        return true;
    }

    /**
     * Lists all Promo models.
     * @return mixed
     */
    public function actionIndex()
    {
        $searchModel = new SearchPromo();
        $dataProvider = $searchModel->search(Yii::$app->request->queryParams);
        $dictionary = Yii::$app->params['dictionary'];
        $loyaltyStatuses = isset($dictionary['loyalty_status']) ? $dictionary['loyalty_status'] : [];
        $bonusStatuses = isset($dictionary['bonus_status']) ? $dictionary['bonus_status'] : [];
        $tableData = [
            'loyalty_status' => function ($model) use ($loyaltyStatuses) {
                return isset($loyaltyStatuses[$model->loyalty_status]) ?
                    $loyaltyStatuses[$model->loyalty_status]['display_name'].' ('.$model->loyalty_status.')' :
                    $model->loyalty_status;
            },
            'bonus_status' => function ($model) use ($bonusStatuses) {
                return isset($bonusStatuses[$model->bonus_status]) ?
                    $bonusStatuses[$model->bonus_status]['name'].' ('.$model->bonus_status.')' :
                    $model->bonus_status;
            },
            'on_form' => function ($model) {
                return $model->on_form == 1 ? 'Доступно' : 'Недоступно';
            },
            'on_link' => function ($model) {
                return $model->on_link == 1 ? 'Доступно' : 'Недоступно';
            }
        ];
        $loyaltyStatuses = array_map(function ($item, $key) {
            return $item['display_name'].'('.$key.')';
        }, $loyaltyStatuses, array_keys($loyaltyStatuses));
        $bonusStatuses = array_map(function ($item, $key) {
            return $item['name'].' ('.$key.')';
        }, $bonusStatuses, array_keys($bonusStatuses));

        return $this->render('index', [
            'searchModel' => $searchModel,
            'dataProvider' => $dataProvider,
            'tableData' => $tableData,
            'loyalty_statuses' => $loyaltyStatuses,
            'bonus_statuses' => $bonusStatuses,
        ]);
    }

    /**
     * Creates a new Promo model.
     * If creation is successful, the browser will be redirected to the 'view' page.
     * @return mixed
     */
    public function actionCreate()
    {
        $model = new Promo();
        $dictionary = Yii::$app->params['dictionary'];
        $loyaltyStatuses = isset($dictionary['loyalty_status']) ? $dictionary['loyalty_status'] : [];
        $loyaltyStatuses = array_map(function ($item, $key) {
            return $item['display_name'].'('.$key.')';
        }, $loyaltyStatuses, array_keys($loyaltyStatuses));
        $bonusStatuses = isset($dictionary['bonus_status']) ? $dictionary['bonus_status'] : [];
        $bonusStatuses = array_map(function ($item, $key) {
            return $item['name'].' ('.$key.')';
        }, $bonusStatuses, array_keys($bonusStatuses));


        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            return $this->redirect(['index']);
        } else {
            return $this->render('create', [
                'model' => $model,
                'loyalty_statuses' => $loyaltyStatuses,
                'bonus_statuses' => $bonusStatuses,
            ]);
        }
    }

    /**
     * Updates an existing Promo model.
     * If update is successful, the browser will be redirected to the 'view' page.
     * @param integer $id
     * @return mixed
     */
    public function actionUpdate($id)
    {
        $model = $this->findModel($id);
        $dictionary = Yii::$app->params['dictionary'];
        $loyaltyStatuses = isset($dictionary['loyalty_status']) ? $dictionary['loyalty_status'] : [];
        $loyaltyStatuses = array_map(function ($item, $key) {
            return $item['display_name'].'('.$key.')';
        }, $loyaltyStatuses, array_keys($loyaltyStatuses));
        $bonusStatuses = isset($dictionary['bonus_status']) ? $dictionary['bonus_status'] : [];
        $bonusStatuses = array_map(function ($item, $key) {
            return $item['name'].' ('.$key.')';
        }, $bonusStatuses, array_keys($bonusStatuses));

        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            return $this->redirect(['index']);
        } else {
            return $this->render('update', [
                'model' => $model,
                'loyalty_statuses' => $loyaltyStatuses,
                'bonus_statuses' => $bonusStatuses,
            ]);
        }
    }

    /**
     * Deletes an existing Promo model.
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
     * Finds the Promo model based on its primary key value.
     * If the model is not found, a 404 HTTP exception will be thrown.
     * @param integer $id
     * @return Promo the loaded model
     * @throws NotFoundHttpException if the model cannot be found
     */
    protected function findModel($id)
    {
        if (($model = Promo::findOne($id)) !== null) {
            return $model;
        } else {
            throw new NotFoundHttpException('The requested page does not exist.');
        }
    }
}
