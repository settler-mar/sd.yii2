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
                    'index' => ['get'],
                    'status' => ['post'],
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
        if (Yii::$app->user->isGuest ||  !Yii::$app->user->can('CharityView')) {
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
     * @param integer $id
     * @return mixed
     */
    public function actionStatus()
    {
        if (Yii::$app->user->isGuest ||  !Yii::$app->user->can('CharityEdit')) {
            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
            return false;
        }
        if (!\Yii::$app->request->isAjax) {
            throw new \yii\web\NotFoundHttpException;
        }
        $ids = \Yii::$app->request->post('ids');
        $status = \Yii::$app->request->post('status');
        $validatorIn = new \yii\validators\RangeValidator(['range' => [0, 1, 2]]);
        $validatorEach = new \yii\validators\EachValidator(['rule' => ['integer']]);
        $error = false;
        if (!isset($status) || !$validatorIn->validate($status, $error)
          || empty($ids) || !is_array($ids) || !$validatorEach->validate($ids, $error)
        ) {
            return json_encode(['error'=>$error]);
        }

        Charity::updateAll(['is_listed' => $status], ['uid' => $ids]);
        return json_encode(['error' => false, 'html' => 'Статус изменён успешно!']);
    }

}
