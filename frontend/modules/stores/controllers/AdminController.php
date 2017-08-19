<?php

namespace frontend\modules\stores\controllers;

use frontend\modules\stores\models\CategoriesStores;
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
       $tariffs = Cpa::find() -> with([
         'cpaLink' => function($query)use($model){
          $query->andWhere(['stores_id' => $model->uid]);
         },
         'actions.tariffs.rates'])
         ->all();

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
        $m = \ORM::for_table('cw_tariffs_rates')->create();
        $m->id_tariff = (int)$post['parent'];
        if($m->save()){
          $data=array(
            'rate'=>array(
              'uid'=>$m->uid,
              'id_tariff'=>$m->id_tariff,
              'id_rate'=>'',
              'date_s'=>'0000-00-00',
            )
          );
          echo $twig->render('rates.html', $data);
          exit;
        }
      }
      if($type=='tariff'){
        $m = \ORM::for_table('cw_actions_tariffs')->create();
        $m->id_action = (int)$post['parent'];
        $m->name = "Новый тариф";
        if($m->save()){
          $data=array(
            'tariff'=>array(
              'uid'=>$m->uid,
              'name'=>$m->name,
              'id_action'=>$m->id_action,
            )
          );
          echo $twig->render('tariffs.html', $data);
          exit;
        }
      }
      if($type=='action'){
        $m = \ORM::for_table('cw_stores_actions')->create();
        $m->cpa_link_id = (int)$post['parent'];
        $m->name = "Новое событие";
        if($m->save()){
          $data=array(
            'action'=>array(
              'uid'=>$m->uid,
              'name'=>$m->name,
              'cpa_link_id'=>$m->cpa_link_id,
              'type'=>0,
            ),
            "action_types" => \Cwcashback\Settings::call()->getDictionary('action_type')
          );
          echo $twig->render('actions.html', $data);
          exit;
        }
      }
      if($type=='cpa'){
        $m = new CpaLink();
        $m->spa_id = (int)$post['code'];
        $m->stores_id = (int)$post['parent'];
        if($m->save(false)){
          $cpa = Cpa::findOne((int)$post['code']);
          $data=array(
            'tariff'=>array(
              'id'=>$m->id,
              'spa_id'=>$m->spa_id,
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
  public function actionAjaxSave($type,$post)
  {
    return true;
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



  function beforeAction($action)
  {
    $this->layout = '@app/views/layouts/admin.twig';
    return true;
  }
}
