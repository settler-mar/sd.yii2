<?php

namespace frontend\modules\meta\controllers;

use Yii;
use frontend\modules\meta\models\Meta;
use frontend\modules\meta\models\LgMeta;
use frontend\modules\meta\models\MetaSearch;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;

/**
 * AdminController implements the CRUD actions for Meta model.
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
   * Lists all Meta models.
   * @return mixed
   */
  public function actionIndex()
  {
    if (Yii::$app->user->isGuest || !Yii::$app->user->can('MetaView')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }

    $searchModel = new MetaSearch();
    $dataProvider = $searchModel->search(Yii::$app->request->queryParams);

    return $this->render('index.twig', [
      'searchModel' => $searchModel,
      'dataProvider' => $dataProvider,
    ]);
  }

  /**
   * Displays a single Meta model.
   * @param integer $id
   * @return mixed
   */
  public function actionView($id)
  {
    if (Yii::$app->user->isGuest || !Yii::$app->user->can('MetaView')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }
    return $this->render('view.twig', [
      'model' => $this->findModel($id),
    ]);
  }

  /**
   * Creates a new Meta model.
   * If creation is successful, the browser will be redirected to the 'view' page.
   * @return mixed
   */
  public function actionCreate()
  {
    if (Yii::$app->user->isGuest || !Yii::$app->user->can('MetaCreate')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }
    $model = new Meta();

    if ($model->load(Yii::$app->request->post()) && $model->save()) {
      return $this->redirect(['index']);
    } else {
      return $this->render('create.twig', [
        'model' => $model,
      ]);
    }
  }

  /**
   * Updates an existing Meta model.
   * If update is successful, the browser will be redirected to the 'view' page.
   * @param integer $id
   * @return mixed
   */
  public function actionUpdate($id)
  {

    if (Yii::$app->user->isGuest || !Yii::$app->user->can('MetaEdit')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }
    $model = $this->findModel($id);


    $base_lang=Yii::$app->params['base_lang'];

    $lg_list=Yii::$app->params['transform_language_list'];
    $languages = [];
    foreach ($lg_list as $lg_key => $lg_item) {
      $languages[$lg_key] = [
        'name' => $lg_item['name'],
        'regions' => $lg_item['regions'],
        'code' => $lg_item['code'],
        'model' => $lg_item['code'] == $base_lang ? null : $this->findLgMeta($id, $lg_item['code'])
      ];
    }

    if ($model->load(Yii::$app->request->post()) && $model->save()) {
        Yii::$app->session->addFlash('info', 'Метаданные обновлены');
      //сохранение переводов
       foreach ($languages as $lg_key => $language) {
           if ($language['model'] != null) {
               if ($language['model']->load(Yii::$app->request->post()) && $language['model']->save()) {
                   Yii::$app->session->addFlash('info', $language['name'] . '. Перевод метаданных обновлен');
               } else {
                   Yii::$app->session->addFlash('err', $language['name'] . '. Ошибка обновления перевода метаданных');
                   header("X-XSS-Protection: 1;");
                   return $this->render('update.twig', [
                       'model' => $model,
                       'languages' => $languages
                   ]);
               }
           }
       }


      return $this->redirect(['index']);
    } else {
      return $this->render('update.twig', [
        'model' => $model,
        'languages' => $languages
      ]);
    }
  }

  /**
   * Deletes an existing Meta model.
   * If deletion is successful, the browser will be redirected to the 'index' page.
   * @param integer $id
   * @return mixed
   */
  public function actionDelete($id)
  {
    if (Yii::$app->user->isGuest || !Yii::$app->user->can('MetaDelete')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }
    $this->findModel($id)->delete();

    return $this->redirect(['index']);
  }

  /**
   * Finds the Meta model based on its primary key value.
   * If the model is not found, a 404 HTTP exception will be thrown.
   * @param integer $id
   * @return Meta the loaded model
   * @throws NotFoundHttpException if the model cannot be found
   */
  protected function findModel($id)
  {
    if (($model = Meta::findOne($id)) !== null) {
      return $model;
    } else {
      throw new NotFoundHttpException('The requested page does not exist.');
    }
  }

  protected function findLgMeta($id, $lang)
  {
    $model = LgMeta::find()->where(['meta_id' => $id, 'language' => $lang])->one();
    if (!$model) {
      $model = new LgMeta();
      $model->meta_id = $id;
      $model->language = $lang;
    }
    return $model;
  }

}
