<?php
namespace frontend\controllers;

use frontend\models\Task;
use frontend\modules\stores\models\CpaLink;
use Yii;
use frontend\components\SdController;
use frontend\modules\stores\models\Cpa;

/**
 * Site controller
 */
class FixingController extends SdController
{
  public function beforeAction($action)
  {
    $this->enableCsrfValidation = false;
    Yii::$app->request->enableCsrfValidation = false;
    parent::beforeAction($action);
    return true;
  }

  /**
   * Добавдяем задачу на обновление платежа адмитада
   */
  public function actionPayment()
  {
    $request = Yii::$app->request;
    $post = $request->post();

    Yii::$app->logger->add(json_encode($post));
    $task = new Task();
    $task->task = 1;
    $task->param = 1;
    $task->add_time = time();
    $task->save();

    return true;
  }

  /**
   * Добавдяем задачу на обновление платежа performancehorizon
   */
  public function actionPaymentph()
  {
    $cpa = Cpa::findOne(['name' => 'Performancehorizon']);
    if (!$cpa) {
      ddd('CPA Performancehorizon not found');
    }

    $request = Yii::$app->request;
    $post = $request->post();

    Yii::$app->logger->add(json_encode($post));
    $task = new Task();
    $task->task = 1;
    $task->param = $cpa->id;
    $task->add_time = time();
    $task->save();

    return true;
  }

    /**
     * платежи из Awin добавляем задачу
     * @return bool
     */
  public function actionAwin()
  {
      $cpa = Cpa::findOne(['name' => 'Awin']);
      if (!$cpa) {
          ddd('CPA Awin not found');
      }

      $request = Yii::$app->request;
      $post = $request->post();

      Yii::$app->logger->add(json_encode($post));
      $task = new Task();
      $task->task = 1;
      $task->param = $cpa->id;
      $task->add_time = time();
      $task->save();

      return true;
  }

  public function actionStores()
  {
    $post = Yii::$app->request->post();
    if (!isset($post["offer_status"])) {
      return false;
    }
    $status = $post["offer_status"];
    $affiliate_id = $post["offer_id"];
    $statusTranslate = ["active" => 1, "disabled" => 0];
    $cpa = CpaLink::findOne(['affiliate_id' => $affiliate_id, 'cpa_id' => 1]);
    if (!$cpa) return;

    $store = $cpa->getStore();
    if (!$store || $store->is_active == -1) return;

    $store->$statusTranslate[$status];
    $store->save();

    return true;
  }
}