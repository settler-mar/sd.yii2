<?php

namespace frontend\modules\transitions\controllers;

use Yii;
use frontend\modules\transitions\models\UsersVisits;
use frontend\modules\transitions\models\TransitionsSearch;
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
            'store' => function ($model, $key, $index, $column) {
                $store = $model->store;
                $out = '';
                if ($store != null) {
                    $out = '<a href="/admin/stores/update/id:';
                    $out .= $store->uid;
                    $out .= '" target=_blank>';
                    $out .= $store->url;
                    $out .= ' (';
                    $out .= $store->uid;
                    $out .= ')</a>';
                }
                return $out;
            },
            'source' => function ($model, $key, $index, $column) {
                return $model->source == 0 ? 'Купоны' : 'Шопы';
            }
           
        ];

        $searchModel = new TransitionsSearch();
        $dataProvider = $searchModel->search(Yii::$app->request->queryParams);
        return $this->render('index', [
            'searchModel' => $searchModel,
            'dataProvider' => $dataProvider,
            'tableValue' => $tableValue,

        ]);
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

    public function beforeAction($action)
    {
        $this->layout = '@app/views/layouts/admin.twig';
        return true;
    }
}
