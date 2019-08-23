<?php

namespace frontend\modules\vendor\controllers;

use frontend\components\SdController;
use frontend\modules\vendor\models\Vendor;
use yii;

class DefaultController extends SdController
{
  private $category = null;
  private $product = null;
  private $store = null;

  private $requestData = [];
  private $cacheName = '';
  private $paginatePath = '';
  private $paginateParams = [];
  protected $vendor;

  public function createAction($id)
  {
    $this->params['disable_breadcrumbs_home_link'] = 1;//для виджета крошек
    $id = (string)$id;
    if ($id) {
      if ($id != \Yii::$app->help->makeRoute($id)) {
        throw new \yii\web\NotFoundHttpException;
      }
      $vendor = Vendor::find()
          ->andWhere(['status' => Vendor::STATUS_ACTIVE])
          ->andWhere(['route' => $id])
          ->one();
      if (!$vendor) {
        throw new \yii\web\NotFoundHttpException;
      }
      $this->vendor = $vendor;
      if (Yii::$app->request->isAjax) {
        //данные айаксом
        echo $this->actionData($id);
        exit;
      }
      echo $this->actionIndex($id);
      exit;
    }
    return parent::createAction($id);
  }

  public function actionIndex()
  {
    $request = Yii::$app->request;
    $vendor = $this->vendor;

    if (empty($vendor->id)) {
      throw new \yii\web\NotFoundHttpException;
    }

    $meta = Yii::$app->runAction('shop/ajax/meta');
    $this->params = $meta->params;
    return $this->render('@frontend/modules/shop/views/default/base');
  }

}
