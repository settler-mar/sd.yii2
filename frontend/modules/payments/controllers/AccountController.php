<?php

namespace frontend\modules\payments\controllers;

use app\modules\payments\models\PaymentsSearch;
use common\components\Help;
use frontend\modules\users\models\Users;
use yii;
use frontend\modules\payments\models\Payments;
use frontend\modules\stores\models\Stores;
use frontend\modules\stores\models\CpaLink;
use frontend\components\Pagination;
use frontend\components\AccountController as Controller;


/**
 * Class AccountController
 * @package frontend\modules\payments\controllers
 */
class AccountController extends Controller
{
  /**
   * @param yii\base\Action $action
   * @return bool
   * @throws yii\web\ForbiddenHttpException
   */
  public function beforeAction($action)
  {
    if (Yii::$app->user->isGuest) {
      throw new \yii\web\ForbiddenHttpException(Yii::t('common', 'page_is_forbidden'));
      return false;
    }
    $this->view->layout_mode='account';
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
      throw new \yii\web\ForbiddenHttpException(Yii::t('commont', 'page_is_forbidden'));
      return false;
    }


    $dataBase = Payments::find()
      ->from(Payments::tableName() . ' cwp')
      ->select(['cwp.*', 'cws.name', 'cws.route', 'cws.is_active', 'cws.is_offline'])
      ->innerJoin(CpaLink::tableName() .
        ' cwsl', 'cwp.affiliate_id = cwsl.affiliate_id AND cwp.cpa_id = cwsl.cpa_id')
      ->innerJoin(Stores::tableName() . ' cws', "cwsl.stores_id = cws.uid")
      ->where(['cwp.user_id' => $id])
      //->orderBy('cwp.action_id DESC');
      ->orderBy('cwp.action_date DESC');


    $search_range = Yii::$app->request->get('date');
    if (empty($search_range) || strpos($search_range, '-') === false) {
      $search_range = date('01-01-2017') . ' - ' . date('d-m-Y');
    }

    list($start_date, $end_date) = explode(' - ', $search_range);
    $data['data_ranger'] = Help::DateRangePicker(
      $start_date . ' - ' . $end_date,
      'date', [
      'pluginEvents' => [
        "apply.daterangepicker" => "function(ev, picker) { 
            picker.element.closest('form').submit(); 
          }",
      ]
    ]);

    $start_date = date('Y-m-d', strtotime($start_date));
    $end_date = date('Y-m-d', strtotime($end_date));
    $dataBase->andFilterWhere(['between', 'action_date', $start_date . ' 00:00:00', $end_date . ' 23:59:59']);

    $total = clone $dataBase;
    $data['total'] = $total
      ->select([
        'count(*) as total',
        'SUM(if(status=0,1,0)) as cnt_pending',
        'SUM(if(status=2,1,0)) as cnt_confirm',
        'SUM(if(status=0,cashback,0)) as sum_pending',
        'SUM(if(status=2,cashback,0)) as sum_confirm',
        'SUM(if(status=0,ref_bonus,0)) as sum_ref_pending',
        'SUM(if(status=2,ref_bonus,0)) as sum_ref_confirm',
      ])
      ->asArray()
      ->one();
    //ddd($data['total']);

    $cacheName = 'account_payments_' . $id . '_' . str_replace(' ', '', $search_range) . '_' . $page;
    $pagination = new Pagination($dataBase, $cacheName, ['page' => $page, 'limit' => 20, 'asArray' => true]);

    $payments = $pagination->data();
    $payStatus = Yii::t('dictionary', 'pay_status');
    foreach ($payments as $key => &$payment) {
      $payment['status_title'] = $payStatus[$payment['status']];
    }
    $data['payments'] = $payments;
    if ($pagination->pages() > 1) {
      $data["pagination"] = $pagination->getPagination('payments/account/ref', ['id' => $id,'date'=>$search_range]);
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
      ->select(['cwp.*', 'cws.name', 'cws.route', 'cws.is_active', 'cws.is_offline'])
      ->innerJoin(CpaLink::tableName() .
        ' cwsl', 'cwp.affiliate_id = cwsl.affiliate_id AND cwp.cpa_id = cwsl.cpa_id')
      ->innerJoin(Stores::tableName() . ' cws', "cwsl.stores_id = cws.uid")
      ->where(['cwp.user_id' => \Yii::$app->user->id])
      //->orderBy('cwp.action_id DESC');
      ->orderBy('cwp.action_date DESC');

    $cacheName = 'account_payments' . \Yii::$app->user->id . '_' . $page;
    $pagination = new Pagination($dataBase, $cacheName, ['page' => $page, 'limit' => 20, 'asArray' => true]);

    $payments = $pagination->data();
    $payStatus = \Yii::t('dictionary', 'pay_status');
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
