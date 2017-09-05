<?php

namespace frontend\modules\payments\controllers;

use frontend\modules\users\models\Users;
use yii;
use frontend\modules\payments\models\Payments;
use frontend\modules\stores\models\Stores;
use frontend\modules\stores\models\CpaLink;
use frontend\components\Pagination;


/**
 * Class AccountController
 * @package frontend\modules\payments\controllers
 */
class AccountController extends \yii\web\Controller
{
  /**
   * @param yii\base\Action $action
   * @return bool
   * @throws yii\web\ForbiddenHttpException
   */
  public function beforeAction($action)
  {
    if (Yii::$app->user->isGuest) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }
    $this->layout = '@app/views/layouts/account.twig';
    return true;
  }

  public function actionRef($id, $page = 1)
  {
    $user=Users::find()
      ->where([
        'uid'=>$id,
        'referrer_id'=>\Yii::$app->user->id
      ])
      ->one();

    if(!$user){
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }


    $dataBase = Payments::find()
      ->from(Payments::tableName() . ' cwp')
      ->select(['cwp.*', 'cws.name', 'cws.route', 'cws.is_active'])
      ->innerJoin(CpaLink::tableName() .
        ' cwsl', 'cwp.affiliate_id = cwsl.affiliate_id AND cwp.cpa_id = cwsl.cpa_id')
      ->innerJoin(Stores::tableName() . ' cws', "cwsl.stores_id = cws.uid")
      ->where(['cwp.user_id' => $id])
      ->orderBy('cwp.action_id DESC');

    $cacheName = 'account_payments' . $id . '_' . $page;
    $pagination = new Pagination($dataBase, $cacheName, ['page' => $page, 'limit' => 20, 'asArray' => true]);

    $payments = $pagination->data();
    $payStatus = \Yii::$app->params['dictionary']['pay_status'];
    foreach ($payments as $key => &$payment) {
      $payment['status_title'] = $payStatus[$payment['status']];
    }
    $data['payments'] = $payments;
    if ($pagination->pages() > 1) {
      $data["pagination"] = $pagination->getPagination('payments/account/ref', ['id'=>$id]);
    }
    $data['ref_user'] = $user;

    return $this->render('ref', $data);
  }

  /**
   * @return string
   * @throws yii\web\NotFoundHttpException
   */
  public function actionIndex($page = 1)
  {
    $dataBase = Payments::find()
      ->from(Payments::tableName() . ' cwp')
      ->select(['cwp.*', 'cws.name', 'cws.route', 'cws.is_active'])
      ->innerJoin(CpaLink::tableName() .
        ' cwsl', 'cwp.affiliate_id = cwsl.affiliate_id AND cwp.cpa_id = cwsl.cpa_id')
      ->innerJoin(Stores::tableName() . ' cws', "cwsl.stores_id = cws.uid")
      ->where(['cwp.user_id' => \Yii::$app->user->id])
      ->orderBy('cwp.action_id DESC');

    $cacheName = 'account_payments_' . \Yii::$app->user->id . '_' . $page;
    $pagination = new Pagination($dataBase, $cacheName, ['page' => $page, 'limit' => 20, 'asArray' => true]);

    $payments = $pagination->data();
    $payStatus = \Yii::$app->params['dictionary']['pay_status'];
    foreach ($payments as $key => &$payment) {
      $payment['status_title'] = $payStatus[$payment['status']];
    }
    $data['payments'] = $payments;
    if ($pagination->pages() > 1) {
      $data["pagination"] = $pagination->getPagination('payments/account', []);
    }

    return $this->render('index', $data);
  }

}
