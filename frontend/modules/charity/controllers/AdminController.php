<?php

namespace frontend\modules\charity\controllers;

use Yii;
use frontend\modules\charity\models\Charity;
use frontend\modules\charity\models\CharitySearch;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;
use common\components\Help;

/**
 * AdminController implements the CRUD actions for Charity model.
 */
class AdminController extends Controller
{
    public function behaviors()
    {
        return [
            'verbs' => [
                'class' => VerbFilter::className(),
                'actions' => [
                    'update' => ['post'],
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
     * Lists all Charity models.
     * @return mixed
     */
    public function actionIndex()
    {
        //todo видимо, нужно другое разрешение
        if (Yii::$app->user->isGuest ||  !Yii::$app->user->can('UserView')) {
            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
            return false;
        }
        $tableValue = [
            'user' => function ($model, $key, $index, $column) {
                $user = $model->user;
                $out = '';
                if ($user != null) {
                    $out = '<a href="/admin/users/update?id=';
                    $out .= $user->uid;
                    $out .= '" target=_blank>';
                    $out .= $user->email;
                    $out .= ' (';
                    $out .= $user->uid;
                    $out .= ')</a>';
                }
                  return $out;
            },
            'foundation' => function ($model, $key, $index, $column) {
                $foundation = $model->foundation;
                $out = '';
                if ($foundation != null) {
                    $out .= $foundation->title.' ('.$foundation->uid.')';
                }
                return $out;
            },
            'status' => function ($model, $key, $index, $column) {
                return Yii::$app->help->colorStatus($model->is_listed);
            },
        ];
        $searchModel = new CharitySearch();
        $dataProvider = $searchModel->search(Yii::$app->request->queryParams);
        return $this->render('index.twig', [
            'searchModel' => $searchModel,
            'dataProvider' => $dataProvider,
            'tableValue' => $tableValue,
            'dataRanger' => Help::DateRangePicker($searchModel, 'add_date_range', ['hideInput'=>false]),
        ]);
    }


    /**
     * Updates an existing Charity model.
     * If update is successful, the browser will be redirected to the 'view' page.
     * @param integer $id
     * @return mixed
     */
    public function actionUpdate($id)
    {
        $model = $this->findModel($id);

//        if ($model->load(Yii::$app->request->post()) && $model->save()) {
//            return $this->redirect(['view', 'id' => $model->uid]);
//        } else {
//            return $this->render('update.twig', [
//                'model' => $model,
//            ]);
//        }
    }


    /**
     * Finds the Charity model based on its primary key value.
     * If the model is not found, a 404 HTTP exception will be thrown.
     * @param integer $id
     * @return Charity the loaded model
     * @throws NotFoundHttpException if the model cannot be found
     */
    protected function findModel($id)
    {
        if (($model = Charity::findOne($id)) !== null) {
            return $model;
        } else {
            throw new NotFoundHttpException('The requested page does not exist.');
        }
    }
}
