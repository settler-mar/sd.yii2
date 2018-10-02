<?php

namespace frontend\modules\template\controllers;

use Yii;
use frontend\modules\template\models\Template;
use frontend\modules\template\models\TemplateSearch;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;
use yii\web\Response;

/**
 * AdminController implements the CRUD actions for Template model.
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

    function beforeAction($action)
    {
        $this->layout = '@app/views/layouts/admin.twig';
        return true;
    }

    /**
     * Lists all Template models.
     * @return mixed
     */
    public function actionIndex()
    {
        if (Yii::$app->user->isGuest || !Yii::$app->user->can('TemplateView')) {
            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
            return false;
        }

        $searchModel = new TemplateSearch();
        $dataProvider = $searchModel->search(Yii::$app->request->queryParams);

        return $this->render('index', [
            'searchModel' => $searchModel,
            'dataProvider' => $dataProvider,
        ]);
    }

    /**
     * Displays a single Template model.
     * @param integer $id
     * @return mixed
     */
//    public function actionView($id)
//    {
//        if (Yii::$app->user->isGuest || !Yii::$app->user->can('TemplateView')) {
//            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
//            return false;
//        }
//        return $this->render('view', [
//            'model' => $this->findModel($id),
//        ]);
//    }

    /**
     * Creates a new Template model.
     * If creation is successful, the browser will be redirected to the 'view' page.
     * @return mixed
     */
//    public function actionCreate()
//    {
//        if (Yii::$app->user->isGuest || !Yii::$app->user->can('TemplateCreate')) {
//            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
//            return false;
//        }
//        $model = new Template();
//
//        if ($model->load(Yii::$app->request->post()) && $model->save()) {
//            return $this->redirect(['view', 'id' => $model->id]);
//        } else {
//            return $this->render('update', [
//                'model' => $model,
//            ]);
//        }
//    }

    /**
     * Updates an existing Template model.
     * If update is successful, the browser will be redirected to the 'view' page.
     * @param integer $id
     * @return mixed
     */
    public function actionUpdate($id)
    {
        if (Yii::$app->user->isGuest || !Yii::$app->user->can('TemplateEdit')) {
            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
            return false;
        }
        $model = $this->findModel($id);

        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            return $this->redirect(['index']);
        } else {
            return $this->render('update', [
                'model' => $model,
                'languageList' => Yii::$app->params['language_list'],
            ]);
        }
    }

    /**
     * Deletes an existing Template model.
     * If deletion is successful, the browser will be redirected to the 'index' page.
     * @param integer $id
     * @return mixed
     */
//    public function actionDelete($id)
//    {
//        if (Yii::$app->user->isGuest || !Yii::$app->user->can('TemplateDelete')) {
//            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
//            return false;
//        }
//        $this->findModel($id)->delete();
//
//        return $this->redirect(['index']);
//    }

    /**
     * @return array
     */
    public function actionTpls()
    {
        if (Yii::$app->user->isGuest || !Yii::$app->user->can('TemplateView')) {
            throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
            return false;
        }
        $out=[];
        $path= __DIR__ . '/../views/browser/';
        $files=scandir($path);
        foreach ($files as $key => $value) {
            if (!in_array($value, [".",".."])) {
                $name=str_replace('.twig', '', $value);
                $out[$name]= file_get_contents($path.$value);
            }
        }
        Yii::$app->response->format = Response::FORMAT_JSON;
        return $out;
    }

    /**
     * Finds the Template model based on its primary key value.
     * If the model is not found, a 404 HTTP exception will be thrown.
     * @param integer $id
     * @return Template the loaded model
     * @throws NotFoundHttpException if the model cannot be found
     */
    protected function findModel($id)
    {
        if (($model = Template::findOne($id)) !== null) {
            return $model;
        } else {
            throw new NotFoundHttpException('The requested page does not exist.');
        }
    }

  public function actionView($id)
  {
    /*if (Yii::$app->user->isGuest || !Yii::$app->user->can('TemplateUpdate')) {
      throw new \yii\web\ForbiddenHttpException(Yii::t('app', 'Page does not exist'));
    }*/
    $model = $this->findModel($id);
    return $model->getTemplate();
  }
}
