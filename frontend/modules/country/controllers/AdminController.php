<?php

namespace frontend\modules\country\controllers;

use Yii;
use frontend\modules\country\models\CountryToLanguage;
use frontend\modules\country\models\CountryToLanguageSearch;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;
use common\models\GeoIpCountry;
use yii\validators\IpValidator;

/**
 * AdminController implements the CRUD actions for CountryToLanguage model.
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
    function beforeAction($action)
    {
        $this->layout = '@app/views/layouts/admin.twig';
        return true;
    }


    /**
     * Lists all CountryToLanguage models.
     * @return mixed
     */
    public function actionIndex()
    {
        if (Yii::$app->user->isGuest || !Yii::$app->user->can('CountryView')) {
            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
            return false;
        }
        $searchModel = new CountryToLanguageSearch();
        $dataProvider = $searchModel->search(Yii::$app->request->queryParams);
        $request = Yii::$app->request;

        $ip = $request->post('ip');
        $validator = new IpValidator;
        $countryText = '';
        if ($validator->validate($ip)) {
            $country = GeoIpCountry::byIp($ip);
            if ($country) {
                $countryText = $country['country'] . ' ('.$country['code'].')';
                $region = CountryToLanguage::find()->where(['country' => $country['code']])->one();
                if ($region) {
                    $countryText .= ', регион "'.$region['region']. '", язык "'.$region['language'].'"';
                }
            }
        }

        return $this->render('index.twig', [
            'searchModel' => $searchModel,
            'dataProvider' => $dataProvider,
            'table_data' => [
                'country_name' => function ($model) {
                    return GeoIpCountry::countryName($model->country).' ('.$model->country.')';
                }
            ],
            'ip' => $ip,
            'country' => $countryText,

        ]);
    }

    /**
     * Displays a single CountryToLanguage model.
     * @param integer $id
     * @return mixed
     */
    public function actionView($id)
    {
        if (Yii::$app->user->isGuest || !Yii::$app->user->can('CountryView')) {
            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
            return false;
        }
        return $this->render('view.twig', [
            'model' => $this->findModel($id),
        ]);
    }

    /**
     * Creates a new CountryToLanguage model.
     * If creation is successful, the browser will be redirected to the 'view' page.
     * @return mixed
     */
    public function actionCreate()
    {
        if (Yii::$app->user->isGuest || !Yii::$app->user->can('CountryCreate')) {
            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
            return false;
        }
        $model = new CountryToLanguage();

        //ddd(GeoIpCountry::countryList());
        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            return $this->redirect(['index']);
        } else {
            return $this->render('create.twig', [
                'model' => $model,
                'countries' => GeoIpCountry::countryList()
            ]);
        }
    }

    /**
     * Updates an existing CountryToLanguage model.
     * If update is successful, the browser will be redirected to the 'view' page.
     * @param integer $id
     * @return mixed
     */
    public function actionUpdate($id)
    {
        if (Yii::$app->user->isGuest || !Yii::$app->user->can('CountryEdit')) {
            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
            return false;
        }
        $model = $this->findModel($id);


        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            return $this->redirect(['index']);
        } else {
            return $this->render('update.twig', [
                'model' => $model,
                'countries' => GeoIpCountry::countryList()
            ]);
        }
    }

    /**
     * Deletes an existing CountryToLanguage model.
     * If deletion is successful, the browser will be redirected to the 'index' page.
     * @param integer $id
     * @return mixed
     */
    public function actionDelete($id)
    {
        if (Yii::$app->user->isGuest || !Yii::$app->user->can('CountryDelete')) {
            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
            return false;
        }
        $this->findModel($id)->delete();

        return $this->redirect(['index']);
    }
    /**
     * Finds the CountryToLanguage model based on its primary key value.
     * If the model is not found, a 404 HTTP exception will be thrown.
     * @param integer $id
     * @return CountryToLanguage the loaded model
     * @throws NotFoundHttpException if the model cannot be found
     */
    protected function findModel($id)
    {
        if (($model = CountryToLanguage::findOne($id)) !== null) {
            return $model;
        } else {
            throw new NotFoundHttpException('The requested page does not exist.');
        }
    }
}
