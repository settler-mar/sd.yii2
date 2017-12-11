<?php

namespace frontend\modules\withdraw\controllers;

use yii;
use frontend\modules\withdraw\models\UsersWithdraw;
use frontend\modules\withdraw\models\WithdrawProcess;
use frontend\components\Pagination;

/**
 * Class AccountController
 * @package frontend\modules\withdraw_history\controllers
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
      throw new \yii\web\ForbiddenHttpException(Yii::t('common', 'page_is_forbidden'));
      return false;
    }
    $this->layout = '@app/views/layouts/account.twig';
    return true;
  }

  public function actionIndex()
  {
    $request = Yii::$app->request;

    if($request->isAjax && $request->isPost){

      $balanse=Yii::$app->user->identity->balance;
      if ($balanse['withdraw_waiting'] > 0){
        return json_encode([
          'error' => [Yii::t('account', 'have_unconfirmed_withdraw_request')]
        ]);
      }
      $withdraw = new UsersWithdraw();

      if ($withdraw->load(Yii::$app->request->post()) && $withdraw->save()) {

        Yii::$app->balanceCalc->todo([$withdraw->user_id], 'withdraw');
        return json_encode([
          'error' => false
        ]);
      } else {
        return json_encode([
          'error' => $withdraw->firstErrors,
        ]);
      }

    }
    return $this->render('index', ['model' => new UsersWithdraw()]);
  }

  /**
   * @return string
   * @throws yii\web\NotFoundHttpException
   */
  public function actionHistory($page=1)
  {

    $validator = new \yii\validators\NumberValidator();
    if (!empty($page) && !$validator->validate($page)) {
      throw new \yii\web\NotFoundHttpException;
    };

    $dataBase = UsersWithdraw::find()
      ->from(UsersWithdraw::tableName() . ' cwuw')
      ->select(['cwuw.*', 'cwwp.name'])
      ->innerJoin(WithdrawProcess::tableName() . ' cwwp', 'cwwp.uid = cwuw.process_id')
      ->where(['cwuw.user_id' => \Yii::$app->user->id])
      ->orderBy('cwuw.request_date DESC');

    $cacheName = 'account_withdrawhistory' . \Yii::$app->user->id . '_' . $page;
    $pagination = new Pagination($dataBase, $cacheName, ['page' => $page, 'limit' => 20, 'asArray' => true]);

    $data['withdraw'] = $pagination->data();

    if ($pagination->pages() > 1) {
      $data["pagination"] = $pagination->getPagination('withdraw/account/history', []);
    }
    $payment_statuses = Yii::t('dictionary', 'pay_status');
    foreach ($data['withdraw'] as &$withdraw) {
        $withdraw['status_title'] = isset($payment_statuses[$withdraw['status']]) ? $payment_statuses[$withdraw['status']] : '';
    }
    return $this->render('history', $data);
  }

}
