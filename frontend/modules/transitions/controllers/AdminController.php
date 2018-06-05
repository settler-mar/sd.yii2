<?php

namespace frontend\modules\transitions\controllers;

use Yii;
use frontend\modules\transitions\models\UsersVisits;
use frontend\modules\transitions\models\TransitionsSearch;
use frontend\modules\stores\models\Stores;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;
use common\components\Help;
use frontend\modules\stores\models\Cpa;
use yii\helpers\ArrayHelper;

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
        if (Yii::$app->user->isGuest ||  !Yii::$app->user->can('TransitionsView')) {
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
                    $out .= '" target=_blank rel="nofollow noopener">';
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
                    $out .= '" target=_blank rel="nofollow noopener">';
                    $out .= $store->url;
                    $out .= ' (';
                    $out .= $store->uid;
                    $out .= ')</a>';
                }
                return $out;
            },
            'source' => function ($model, $key, $index, $column) {
                return $model->source == 1 ? 'Купоны' : 'Шопы';
            },
            'cpa_name' => function ($model) {
                return $model->cpaLink->cpa->name;
            }
           
        ];

        $searchModel = new TransitionsSearch();
        $dataProvider = $searchModel->search(Yii::$app->request->queryParams);

        //статистика - по выборке
        $stat = clone $dataProvider->query;
        $watches = clone $dataProvider->query;
        $stat = $stat
            ->select(['cw_cpa.name', 'cw_cpa.id', 'count(*) as count'])
            ->groupBy(['cw_cpa.name', 'cw_cpa.id'])
            ->orderBy('cw_cpa.id')
            ->asArray()
            ->all();

        $watches = $watches
            ->innerJoin(Stores::tableName().' cws', UsersVisits::tableName(). '.store_id = cws.uid')
            ->select(['cws.uid', 'cws.name', 'count(*) as count'])
            ->andWhere(['cws.watch_transitions' => 1])
            ->groupBy(['cws.uid', 'cws.name'])
            ->orderBy('cws.name')
            ->asArray()
            ->all();

        return $this->render('index', [
            'searchModel' => $searchModel,
            'dataProvider' => $dataProvider,
            'tableValue' => $tableValue,
            'data_ranger' => Help::DateRangePicker($searchModel, 'visit_date_range', ['hideInput'=>false]),
            'cpa_names' => ArrayHelper::map(Cpa::find()->select(['id', 'name'])->asArray()->all(), 'id', 'name'),
            'stat' => $stat,
            'watches' => $watches,
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
