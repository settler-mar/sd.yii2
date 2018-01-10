<?php

namespace frontend\modules\constants\controllers;

use Yii;
use frontend\modules\constants\models\Constants;
use frontend\modules\constants\models\ConstantsSearch;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;
use unclead\multipleinput\MultipleInput;

/**
 * AdminController implements the CRUD actions for Constants model.
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
    /*$rule=[
      $action->controller->id,
      ucfirst(strtolower($action->controller->module->id)),
      ucfirst(strtolower($action->id)),
    ];
    $rule=implode('',$rule);

    if (Yii::$app->user->isGuest || !Yii::$app->user->can($rule)) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }*/

    $this->layout = '@app/views/layouts/admin.twig';
    return true;
  }

  /**
   * Lists all Constants models.
   * @return mixed
   */
  public function actionIndex()
  {
    if (Yii::$app->user->isGuest ||  !Yii::$app->user->can('ConstantsView')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }
    $searchModel = new ConstantsSearch();
    $dataProvider = $searchModel->search(Yii::$app->request->queryParams);

    return $this->render('index.twig', [
      'searchModel' => $searchModel,
      'dataProvider' => $dataProvider,
    ]);
  }

  public function actionUpdate($id)
  {
    if (Yii::$app->user->isGuest ||  !Yii::$app->user->can('ConstantsEdit')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }
      $model = $this->findModel($id);
      if ($model->load(Yii::$app->request->post()) && $model->save()) {
        return $this->redirect(['index']);
      }
      return $this->render('update', [
        'model' => $model,
        'mp_class' =>MultipleInput::className()
      ]);
  }

  /**
   * Finds the Constants model based on its primary key value.
   * If the model is not found, a 404 HTTP exception will be thrown.
   * @param integer $id
   * @return Constants the loaded model
   * @throws NotFoundHttpException if the model cannot be found
   */
  protected function findModel($id)
  {
    if (($model = Constants::findOne($id)) !== null) {
      return $model;
    } else {
      throw new NotFoundHttpException('The requested page does not exist.');
    }
  }
}
