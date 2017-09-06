<?php

namespace frontend\modules\stores\controllers;

use frontend\modules\payments\models\Payments;
use frontend\modules\stores\models\ActionsTariffs;
use frontend\modules\stores\models\CategoriesStores;
use frontend\modules\stores\models\StoresActions;
use frontend\modules\stores\models\TariffsRates;
use Yii;
use frontend\modules\stores\models\Stores;
use frontend\modules\stores\models\StoresSearch;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;
use yii\web\UploadedFile;
use yii\db\ActiveRecord;
use frontend\modules\stores\models\StoresToCategories;
use frontend\modules\stores\models\Cpa;
use frontend\modules\stores\models\CpaLink;

/**
 * AdminController implements the CRUD actions for Stores model.
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
   * Lists all Stores models.
   * @return mixed
   */
  public function actionIndex()
  {
    if (Yii::$app->user->isGuest || !Yii::$app->user->can('ShopView')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }

    $searchModel = new StoresSearch();
    $dataProvider = $searchModel->search(Yii::$app->request->queryParams);

    return $this->render('index.twig', [
      'searchModel' => $searchModel,
      'dataProvider' => $dataProvider,
      'table_value' => [
        'is_active' => function ($model, $key, $index, $column) {
          $st = [
            1 => "Активен",
            0 => "Приостановлен",
            -1 => "Выключен",
          ];
          $v = isset($st[$model->is_active]) ? $st[$model->is_active] : "ОШИБКА !!!";
          return $v;
        },
        'route' => function ($model, $key, $index, $column) {
          $out = '<a href="/stores/';
          $out .= $model->route;
          $out .= '" target=_blank>';
          $out .= $model->route;
          $out .= '</a>';
          return $out;
        },
      ]
    ]);
  }

  /**
   * Creates a new Stores model.
   * If creation is successful, the browser will be redirected to the 'view' page.
   * @return mixed
   */
  public function actionCreate()
  {
    if (Yii::$app->user->isGuest || !Yii::$app->user->can('ShopCreate')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }

    $model = new Stores();

    if ($model->load(Yii::$app->request->post()) && $model->save()) {
      return $this->redirect(['index']);
    } else {
      //ddd($model);
      return $this->render('create.twig', [
        'model' => $model,
      ]);
    }
  }

  public function actionUpdate($id)
  {
    if (Yii::$app->user->isGuest || !Yii::$app->user->can('ShopEdit')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }
    //ddd(Yii::$app->request->post());
    $model = $this->findModel($id);
    if (isset(Yii::$app->request->post()['category_id'])) {
      StoresToCategories::deleteAll(['store_id' => $model->uid]);
      foreach (Yii::$app->request->post()['category_id'] as $category_id) {
        $new_category = new StoresToCategories();
        $new_category->category_id = $category_id;
        $new_category->store_id = $model->uid;
        $new_category->save();
      }
    }
    if ($model->load(Yii::$app->request->post())) {   // data from request
      $model->save();
      return $this->redirect(['index']);
    } else {
      $cpa_list = Cpa::find()->all();
      $all_categories = CategoriesStores::find()->where(['parent_id' => 0])->all();
      $models = StoresToCategories::find()->asArray()->select('category_id')->where(['store_id' => $model->uid])->all();
      $categories = [];
      foreach ($models as $storeCategory) {
        $categories[] = $storeCategory['category_id'];
      }
      $tariffs = CpaLink::find()->where(['stores_id' => $model->uid])->with([
        'cpa',
        'storeActions.tariffs.rates'])
        ->all();
      //ddd($categories[0]);
      return $this->render('update', [
        'store' => $model,
        'model' => $model,
        'cpa_list' => $cpa_list,
        'categories' => $all_categories,
        'store_categories' => $categories,
        'tariffs' => $tariffs,
        "action_types" => Yii::$app->params['dictionary']['action_type'],
      ]);
    }
  }

  /**
   * Deletes an existing Stores model.
   * If deletion is successful, the browser will be redirected to the 'index' page.
   * @param integer $id
   * @return mixed
   */
  public function actionDelete($id)
  {
    if (Yii::$app->user->isGuest || !Yii::$app->user->can('ShopDelete')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }

    $store = $this->findModel($id);
    if ($store && $this->actionAjax_remove('store', $id,false)) {
      $store->removeImage(Yii::$app->getBasePath() . '\web' . $store->logo);
    }

    return $this->redirect(['index']);
  }

  public function actionAjax_insert($params = 0)
  {
    if (Yii::$app->user->isGuest || !Yii::$app->user->can('ShopCreate')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }

    $request = Yii::$app->request;
    if (!$request->isPost || !$request->isAjax) {
      throw new \yii\web\ForbiddenHttpException('Не верный тип запроса.');
      return false;
    }

    $post = Yii::$app->request->post();

    $type = $params === 0 ? $post['type'] : $params;

    if ($type == 'rate') {
      $tariffRate = new TariffsRates();
      $tariffRate->id_tariff = (int)$post['parent'];
      $tariffRate->id_rate = 0;
      $tariffRate->price_s = 0;
      $tariffRate->size = 0;
      $tariffRate->our_size = 0;
      $tariffRate->is_percentage = 0;
      $tariffRate->date_s = date('Y-m-d');
      if ($tariffRate->save()) {
        $data = array(
          'rate' => $tariffRate
        );
        echo $this->renderAjax('store/rates.twig', $data);
        exit;
      }
    }
    if ($type == 'tariff') {
      $actionTariffs = new ActionsTariffs();
      $actionTariffs->id_action = (int)$post['parent'];
      $actionTariffs->name = "Новый тариф";
      $actionTariffs->id_tariff = 0;
      if ($actionTariffs->save()) {
        $data = array(
          'tariff' => $actionTariffs
        );
        echo $this->renderAjax('store/tariffs.twig', $data);
        exit;
      }
    }
    if ($type == 'action') {
      $storeAction = new StoresActions();
      $storeAction->cpa_link_id = (int)$post['parent'];
      $storeAction->name = "Новое событие";
      $storeAction->action_id = 0;
      $storeAction->hold_time = 0;
      if ($storeAction->save()) {
        $data = array(
          'action' => $storeAction,
          "action_types" => Yii::$app->params['dictionary']['action_type']
        );
        echo $this->renderAjax('store/actions.twig', $data);
        exit;
      }
    }
    if ($type == 'cpa') {
      $m = new CpaLink();
      $m->cpa_id = (int)$post['code'];
      $m->stores_id = (int)$post['parent'];
      if ($m->save(false)) {
        $cpa = Cpa::findOne((int)$post['code']);
        $data = array(
          'tariff' => array(
            'id' => $m->id,
            'cpa_id' => $m->cpa_id,
            'stores_id' => $m->stores_id,
            'cpa' => array('name' => $cpa->name),
          )
        );
        $out = array(
          'tab_body' => $this->renderAjax('store/tab_body.twig', $data),
          'tab_head_but' => $this->renderAjax('store/tab_head_but.twig', $data),
          'tab_head_suf' => $this->renderAjax('store/tab_head_suf.twig', $data),
        );
        return json_encode($out);
      }
    }
    http_response_code(404);
    exit;
  }

  public function actionAjax_save($params = 0)
  {
    if (Yii::$app->user->isGuest || !Yii::$app->user->can('ShopEdit')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }

    $request = Yii::$app->request;
    if (!$request->isPost || !$request->isAjax) {
      throw new \yii\web\ForbiddenHttpException('Не верный тип запроса.');
      return false;
    }

    $post = $request->post();

    if ($params === 0) {
      $params = $request->post('type');
    }

    if ($params == 'rate') {
      return $this->AjaxSaveRate($post);
    }
    if ($params == 'active_cpa') {
      return $this->AjaxSaveActiveCpa($post);
    }
    if ($params == 'cpa') {
      return $this->AjaxSaveCpa($post);
    }
    if ($params == 'action') {
      return $this->AjaxSaveAction($post);
    }
    if ($params == 'tariff') {
      return $this->AjaxSaveTariff($post);
    }
    http_response_code(404);
    exit;
  }

  public function actionAjax_remove($params = 0, $id = 0, $not_return = true)
  {
    if (Yii::$app->user->isGuest || !Yii::$app->user->can('ShopDelete')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }

    $request = Yii::$app->request;
    /* if(!$request->isPost || !$request->isAjax){
       throw new \yii\web\ForbiddenHttpException('Не верный тип запроса.');
       return false;
     }*/

    $post = Yii::$app->request->post();
    if ($id > 0) {
      $post['id'] = $id;
    }

    $type = $params === 0 ? $post['type'] : $params;

    $todo = false;
    $post['id'] = array($post['id']);
    if ($type == 'store') {
      $todo = true;
      $store_id = $post['id'];

      $cpa_link=CpaLink::find()
        ->select(['affiliate_id'=>'id','cpa_id'])
        ->where(['stores_id'=>$store_id])
        ->asArray()
        ->all();

      $payment = Payments::find();
//        ->andFilterWhere(['OR',$cpa_link]);

      foreach ($cpa_link as &$item){
        $payment = $payment->orFilterWhere(['AND',$item]);
        //$item=["AND",'affiliate_id'=>$item['affiliate_id'],'cpa_id'=>$item['cpa_id']];
      }

      $payment = $payment
        ->asArray()
        ->all();


      if (count($payment) > 0) {
        if(!$not_return){
          return false;
        }
        http_response_code(404);
        exit;
      }
      $cwsl = CpaLink::find()
        ->select('id')
        ->where(['stores_id' => $store_id])
        ->asArray()
        ->all();
      if (count($cwsl) > 0) {
        $type = 'cpa';
        $post["id"] = [];
        foreach ($cwsl as $item) {
          $post["id"][] = $item['id'];
        }
      }
      Stores::deleteAll(['uid' => $store_id]);
      //$this->Delete($store_id[0]);  !!!!! надо переписать эту функцию для очистки БД от хлама
    }
    if ($type == 'cpa') {
      $todo = true;
      $cpa_id = $post['id'];
      $payment = Payments::find()
        ->where(['cpa_id' => $cpa_id])
        ->asArray()
        ->all();
      if (count($payment) > 0) {
        if(!$not_return){
          return false;
        }
        http_response_code(404);
        exit;
      }
      $storesActions = StoresActions::find()
        ->select('uid')
        ->where(["cpa_link_id" => $cpa_id])
        ->asArray()
        ->all();
      if (count($storesActions) > 0) {
        $type = 'action';
        $post["id"] = [];
        foreach ($storesActions as $item) {
          $post["id"][] = $item['uid'];
        }
      }
      //$tmp = count(CpaLink::find()->all());
      CpaLink::deleteAll(['id' => $cpa_id]);
      //return $tmp . ' ' . count(CpaLink::find()->all()) . ' ' . $cpa_id;
    }

    if ($type == 'action') {
      $todo = true;
      $action_id = $post['id'];
      $actionsTariffs = ActionsTariffs::find()
        ->select('uid')
        ->where(['id_action' => $action_id])
        ->asArray()
        ->all();
      if (count($actionsTariffs) > 0) {
        $type = 'tariff';
        $post["id"] = [];
        foreach ($actionsTariffs as $item) {
          $post["id"][] = $item['uid'];
        }
      }
      StoresActions::deleteAll(['uid' => $action_id]);
    }
    if ($type == 'tariff') {
      $todo = true;
      $tariff_id = $post['id'];
      $rates = TariffsRates::find()
        ->select('uid')
        ->where(['id_tariff' => $tariff_id])
        ->asArray()
        ->all();
      if (count($rates) > 0) {
        $type = 'rate';
        $post["id"] = [];
        foreach ($rates as $item) {
          $post["id"][] = $item['uid'];
        }
      }
      ActionsTariffs::deleteAll(['uid' => $tariff_id]);
    }
    if ($type == 'rate') {
      $todo = true;
      TariffsRates::deleteAll(['uid' => $post["id"]]);
    }

    if(!$not_return){
      return $todo;
    }

    if ($todo) {
      http_response_code(200);
      exit;
    }
    http_response_code(404);
    exit;
  }

  /**
   * Finds the Stores model based on its primary key value.
   * If the model is not found, a 404 HTTP exception will be thrown.
   * @param integer $id
   * @return Stores the loaded model
   * @throws NotFoundHttpException if the model cannot be found
   */
  protected function findModel($id)
  {
    if (($model = Stores::findOne($id)) !== null) {
      return $model;
    } else {
      throw new NotFoundHttpException('The requested page does not exist.');
    }
  }

  public function AjaxSaveRate($post)
  {
    $model = TariffsRates::findOne($post['id']);
    $model[$post['name']] = $post['value'];
    $model->save(false);
    http_response_code(200);
    exit;
  }

  public function AjaxSaveCpa($post)
  {
    $model = CpaLink::findOne($post['id']);
    $model[$post['name']] = $post['value'];
    $model->save(false);
    http_response_code(200);
    exit;
  }

  public function AjaxSaveAction($post)
  {
    $model = StoresActions::findOne($post['id']);
    $model[$post['name']] = $post['value'];
    $model->save(false);
    http_response_code(200);
    exit;
  }

  public function AjaxSaveTariff($post)
  {
    $model = ActionsTariffs::findOne($post['id']);
    $model[$post['name']] = $post['value'];
    $model->save(false);
    http_response_code(200);
    exit;
  }

  public function AjaxSaveActiveCpa($post)
  {
    $store = Stores::findOne($post['id']);
    $store->active_cpa = $post['value'];
    return $store->save(false);
  }

}
