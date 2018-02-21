<?php

namespace frontend\modules\banners\controllers;

use Yii;
use frontend\modules\banners\models\Banners;
use frontend\modules\banners\models\SearchBanners;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;

/**
 * AdminController implements the CRUD actions for Banners model.
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

    public function beforeAction($action)
    {
        $this->layout = '@app/views/layouts/admin.twig';
        return true;
    }

    /**
     * Lists all Banners models.
     * @return mixed
     */
    public function actionIndex()
    {
        if (Yii::$app->user->isGuest ||  !Yii::$app->user->can('BannerView')) {
            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
            return false;
        }

        $searchModel = new SearchBanners();
        $dataProvider = $searchModel->search(Yii::$app->request->queryParams);

        return $this->render('index.twig', [
            'searchModel' => $searchModel,
            'dataProvider' => $dataProvider,
            'table_data' => [
                'is_active' => function ($model, $value, $index, $column) {
                    return $model->is_active == 1 ? 'Отобразить' : 'Скрыть';
                },
                'show_desctop' => function ($model, $value, $index, $column) {
                    return $model->show_desctop == 1 ? 'Отобразить' : 'Скрыть';
                },
                'show_mobile' => function ($model, $value, $index, $column) {
                    return $model->show_mobile == 1 ? 'Отобразить' : 'Скрыть';
                },
                'new_window' => function ($model, $value, $index, $column) {
                    return $model->new_window == 1 ? 'В новом окне' : 'В своём окне';
                }
            ],
        ]);
    }

    /**
     * Creates a new Banners model.
     * If creation is successful, the browser will be redirected to the 'view' page.
     * @return mixed
     */
    public function actionCreate()
    {
        if (Yii::$app->user->isGuest ||  !Yii::$app->user->can('BannerCreate')) {
            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
            return false;
        }

        $model = new Banners();

        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            return $this->redirect(['index', 'id' => $model->uid]);
        } else {
            $model->order = 0;
            $model->new_window = 1;
            return $this->render('create.twig', [
                'model' => $model,
            ]);
        }
    }

    /**
     * Updates an existing Banners model.
     * If update is successful, the browser will be redirected to the 'view' page.
     * @param integer $id
     * @return mixed
     */
    public function actionUpdate($id)
    {
        if (Yii::$app->user->isGuest ||  !Yii::$app->user->can('BannerEdit')) {
            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
            return false;
        }
        $model = $this->findModel($id);

        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            return $this->redirect(['index']);
        } else {
          return $this->render('update.twig', [
                'model' => $model,
            ]);
        }
    }

    /**
     * Deletes an existing Banners model.
     * If deletion is successful, the browser will be redirected to the 'index' page.
     * @param integer $id
     * @return mixed
     */
    public function actionDelete($id)
    {
        if (Yii::$app->user->isGuest ||  !Yii::$app->user->can('BannerDelete')) {
            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
            return false;
        }
        $this->findModel($id)->delete();

        return $this->redirect(['index']);
    }

    /**
     * Finds the Banners model based on its primary key value.
     * If the model is not found, a 404 HTTP exception will be thrown.
     * @param integer $id
     * @return Banners the loaded model
     * @throws NotFoundHttpException if the model cannot be found
     */
    protected function findModel($id)
    {
        if (($model = Banners::findOne($id)) !== null) {
            return $model;
        } else {
            throw new NotFoundHttpException('The requested page does not exist.');
        }
    }
}
