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
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      return false;
    }
    $this->layout = '@app/views/layouts/account.twig';
    return true;
  }

  public function actionIndex()
  {
    $request = Yii::$app->request;

    if($request->isAjax && $request->isPost){
      $balans=Yii::$app->user->identity->balabce;
      $amount=$request->post('amount');

      if(
        !$request->post('withdraw-process')!= null ||
        (int)$request->post('withdraw-process') == 0
      ){
        return json_encode(['error' => ['Не выбран способ вывода денег.']]);
      }

      if(
        !$request->post('bill')!= null ||
        (int)$request->post('bill') == 0
      ){
        return json_encode(['error' => ['Не заполнены реквизиты перевода.']]);
      }

      if($balans['current']<350){
        return json_encode(['error' => ['На балансе недостаточная сумма для вывода.']]);
      }
      if($amount<350){
        return json_encode(['error' => ['Минимальная сумма для вывода 350р.']]);
      }
      if($amount>$balans['current']){
        return json_encode([
          'error' => ['Максимальная сумма для вывода '.number_format($balans['current'],2,'.',' ').'р.']
        ]);
      }

      $withdraw = new UsersWithdraw();
      $withdraw->admin_comment='';
      $withdraw->process_id=$request->post('withdraw-process');
      $withdraw->bill = $request->post('bill');
      $withdraw->amount = number_format($amount, 2, ".", "");
      $withdraw->status = 1;
      $withdraw->user_comment = $request->post('additional-info');
      $withdraw->save();

      Yii::$app->balanceCalc->todo([$withdraw->user_id], 'withdraw');

      return json_encode([
        'error' => false
      ]);
    }
    return $this->render('index');
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

    $cacheName = 'account_withdraw_history_' . \Yii::$app->user->id . '_' . $page;
    $pagination = new Pagination($dataBase, $cacheName, ['page' => $page, 'limit' => 20, 'asArray' => true]);

    $data['withdraw'] = $pagination->data();

    if ($pagination->pages() > 1) {
      $data["pagination"] = $pagination->getPagination('withdraw/account/history', []);
    }

    return $this->render('history', $data);
  }

}
