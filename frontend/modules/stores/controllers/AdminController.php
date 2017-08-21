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

    /**
     * Lists all Stores models.
     * @return mixed
     */
    public function actionIndex()
    {
        $searchModel = new StoresSearch();
        $dataProvider = $searchModel->search(Yii::$app->request->queryParams);

        return $this->render('index.twig', [
            'searchModel' => $searchModel,
            'dataProvider' => $dataProvider,
        ]);
    }

    /**
     * Creates a new Stores model.
     * If creation is successful, the browser will be redirected to the 'view' page.
     * @return mixed
     */
    public function actionCreate()
    {
        $model = new Stores();

        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            return $this->redirect(['index']);
        } else {
            return $this->render('create.twig', [
                'model' => $model,
            ]);
        }
    }

    public function actionUpdate($id)
    {
      $model = $this->findModel($id);
      if ($model->load(Yii::$app->request->post())){   // data from request
        $model->save();
        return $this->redirect(['index']);
      }
      else {
        $cpa_list = Cpa::find()->all();
        $categories = CategoriesStores::find()->where(['parent_id'=> $model->uid])->all();
        //$cwsl = \ORM::forTable("cw_cpa_link")
       /* $tariffs = Cpa::find()
          ->joinWith([
            'cpaLink' => function ($query) use($model) {
              $query->onCondition(['stores_id' => $model->uid]);
            },
          ])
          ->joinWith('storesActions')->all();*/
       $tariffs = CpaLink::find() ->where(['stores_id' => $model->uid])-> with([
         'cpa',
         'storeActions.tariffs.rates'])
         ->all();
      foreach ($tariffs as $q=>$y)
       d($y->storeActions);
     // ddd(22);
        return $this->render('update', [
            'store' => $model,
            'model' => $model,
            'cpa_list' => $cpa_list,
            'categories' => $categories,
            'tariffs' => $tariffs,
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
        $store = $this->findModel($id);
          if ($store){
            $store->removeImage(Yii::$app->getBasePath().'\web'.$store->logo);
            $store->delete();
          }

        return $this->redirect(['index']);
    }

    public function actionAjax_insert(){
      $post = Yii::$app->request->post();
      $type = $post['type'];
      $path=realpath(Yii::$app->getBasePath().'\modules\stores\views\admin\store/');
      $loader = new \Twig_Loader_Filesystem($path);
      $twig = new \Twig_Environment($loader, array(
        'auto_reload' => true
      ));

      if($type=='rate'){
        $tariffRate = new TariffsRates();
        $tariffRate->id_tariff = (int)$post['parent'];
        $tariffRate->id_rate = 0;
        $tariffRate->price_s = 0;
        $tariffRate->size = 0;
        $tariffRate->our_size = 0;
        $tariffRate->is_percentage = 0;
        if($tariffRate->save()){
          $data=array(
            'rate'=>array(
              'uid'=>$tariffRate->uid,
              'id_tariff'=>$tariffRate->id_tariff,
              'id_rate'=>'',
              'date_s'=>'0000-00-00',
            )
          );
          echo $twig->render('rates.html', $data);
          exit;
        }
      }
      if($type=='tariff'){
        $actionTariffs = new ActionsTariffs();
        $actionTariffs->id_action = (int)$post['parent'];
        $actionTariffs->name = "Новый тариф";
        $actionTariffs->id_tariff = 0;
        if($actionTariffs->save()){
          $data=array(
            'tariff'=>array(
              'uid'=>$actionTariffs->uid,
              'name'=>$actionTariffs->name,
              'id_action'=>$actionTariffs->id_action,
            )
          );
          echo $twig->render('tariffs.html', $data);
          exit;
        }
      }
      if($type=='action'){
        $storeAction = new StoresActions();
        $storeAction->cpa_link_id = (int)$post['parent'];
        $storeAction->name = "Новое событие";
        $storeAction->action_id = 0;
        $storeAction->hold_time = 0;
        if($storeAction->save()){
          $data=array(
            'action'=>array(
              'uid'=>$storeAction->uid,
              'name'=>$storeAction->name,
              'cpa_link_id'=>$storeAction->cpa_link_id,
              'type'=>0,
            ),
            "action_types" => Yii::$app->params['dictionary']['action_type']
          );
          echo $twig->render('actions.html', $data);
          exit;
        }
      }
      if($type=='cpa'){
        $m = new CpaLink();
        $m->cpa_id = (int)$post['code'];
        $m->stores_id = (int)$post['parent'];
        if($m->save(false)){
          $cpa = Cpa::findOne((int)$post['code']);
          $data=array(
            'tariff'=>array(
              'id'=>$m->id,
              'cpa_id'=>$m->cpa_id,
              'stores_id'=>$m->stores_id,
              'name'=>$cpa->name,
            )
          );
          $out=array(
            'tab_body'=>$twig->render('tab_body.html', $data),
            'tab_head_but'=>$twig->render('tab_head_but.html', $data),
            'tab_head_suf'=>$twig->render('tab_head_suf.html', $data),
          );
          return json_encode($out);
        }
      }
      http_response_code(404);
      exit;
    }
  public function actionAjax_save($type=0)
  {

    $post = Yii::$app->request->post();
    $type = $post['type'];
    if($type=='rate'){
      return $this->AjaxSaveRate($post);
    }
    if($type=='active_cpa'){
      return $this->AjaxSaveActiveCpa($post);
    }
    if($type=='cpa'){
      return $this->AjaxSaveCpa($post);
    }
    if($type=='action'){
      return $this->AjaxSaveAction($post);
    }
    if($type=='tariff'){
      return $this->AjaxSaveTariff($post);
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

  public function AjaxSaveRate($post){
    $model = TariffsRates::findOne($post['id']);
    $model[$post['name']] = $post['value'];
    $model->save(false);
    http_response_code(200);
    exit;
  }
  public function AjaxSaveCpa($post){
    $model = CpaLink::findOne($post['id']);
    $model[$post['name']] = $post['value'];
    $model->save(false);
    http_response_code(200);
    exit;
  }
  public function AjaxSaveAction($post){
    $model = StoresActions::findOne($post['id']);
    $model[$post['name']] = $post['value'];
    $model->save(false);
    http_response_code(200);
    exit;
  }
  public function AjaxSaveTariff($post){
    $model = ActionsTariffs::findOne($post['id']);
    $model[$post['name']] = $post['value'];
    $model->save(false);
    http_response_code(200);
    exit;
  }

  public function AjaxSaveActiveCpa($post){
    $store = Stores::findOne($post['id']);
    $store->active_cpa = $post['value'];
    return $store->save(false);
  }

  public function actionAjax_remove(){
    $post = Yii::$app->request->post();
    $type = $post['type'];
    $todo=false;
    //$post['id']=array($post['id']);
    if($type=='store'){
      $todo=true;
      $store_id=$post['id'];
      $payment= Payments::find()->with([
        'cpaLink' => function($query)use($store_id){
          $query->andWhere(['stores_id' => $store_id]);
        }])
        ->asArray()
        ->all();
      if(count($payment)>0){
        http_response_code(404);
        exit;
      }
      $cwsl = CpaLink::find()
        ->select('id')
        ->where(['stores_id' => $store_id])
        ->asArray()
        ->all();
      if(count($cwsl)>0){
        $type='cpa';
        $post["id"]=[];
        foreach ($cwsl as $item){
          $post["id"][]=$item['id'];
        }
      }
      Stores::deleteAll(['uid' => $store_id]);
      //$this->Delete($store_id[0]);  !!!!! надо переписать эту функцию для очистки БД от хлама
    }
    if($type=='cpa'){
      $todo=true;
      $cpa_id=$post['id'];
      $payment= Payments::find()
        ->where(['spa_id'=> $cpa_id])
        ->asArray()
        ->all();
      if(count($payment)>0){
        http_response_code(404);
        exit;
      }
      $storesActions = StoresActions::find()
        ->select('uid')
        ->where(["cpa_link_id"=> $cpa_id])
        ->asArray()
        ->all();
      if(count($storesActions)>0){
        $type='action';
        $post["id"]=[];
        foreach ($storesActions as $item){
          $post["id"][]=$item['uid'];
        }
      }
      $tmp = count(CpaLink::find()->all());
      CpaLink::deleteAll(['id' => $cpa_id]);
      return $tmp.' '.count(CpaLink::find()->all()).' '.$cpa_id;
    }
    if($type=='action'){
      $todo=true;
      $action_id=$post['id'];
      $actionsTariffs = ActionsTariffs::find()
        ->select('uid')
        ->where(['id_action' => $action_id])
        ->asArray()
        ->all();
      if(count($actionsTariffs)>0){
        $type='tariff';
        $post["id"]=[];
        foreach ($actionsTariffs as $item){
          $post["id"][]=$item['uid'];
        }
      }
      StoresActions::deleteAll(['uid' => $action_id]);
    }
    if($type=='tariff'){
      $todo=true;
      $tariff_id=$post['id'];
      $rates = TariffsRates::find()
        ->select('uid')
        ->where(['id_tariff' => $tariff_id])
        ->asArray()
        ->all();
      if(count($rates)>0){
        $type='rate';
        $post["id"]=[];
        foreach ($rates as $item){
          $post["id"][]=$item['uid'];
        }
      }
      ActionsTariffs::deleteAll(['uid' => $tariff_id]);
    }
    if($type=='rate'){
      $todo=true;
      TariffsRates::deleteAll(['uid' => $post["id"]]);
    }
    if($todo){
      http_response_code(200);
      exit;
    }
    http_response_code(404);
    exit;
  }

  function beforeAction($action)
  {
    $this->layout = '@app/views/layouts/admin.twig';
    return true;
  }
}
