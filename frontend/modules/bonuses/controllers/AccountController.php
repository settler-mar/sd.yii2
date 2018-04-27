<?php

namespace frontend\modules\bonuses\controllers;

use yii;
use frontend\modules\payments\models\Payments;
use frontend\modules\stores\models\CpaLink;
use frontend\modules\stores\models\Stores;
use frontend\components\Pagination;

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
    $this->view->layout_mode='account';
    return true;
  }

  public function actionIndex()
  {
    $limit = 20;
    $request = Yii::$app->request;

    $page = $request->get('page');

    $validator = new \yii\validators\NumberValidator();
    if (!empty($page) && !$validator->validate($page)) {
      throw new \yii\web\NotFoundHttpException;
    };

    $sql = "SELECT a.* FROM (SELECT cwn.* FROM cw_users_notification cwn WHERE " .
      "type_id in (2,3) AND user_id = " . \Yii::$app->user->id .
      " UNION " .
      "SELECT -uid,ref_id,3,status_updated,1,status,ref_bonus,uid,'','',0 FROM cw_payments " .
      "WHERE status in (0,1) AND ref_id = " . \Yii::$app->user->id . ") a " .
      "LEFT JOIN cw_users cwu on a.user_id = cwu.uid  ORDER BY a.added DESC ";


    $cacheName = 'account_bonuses_' . \Yii::$app->user->id . '_count';
    $dataBase = Payments::findBySql($sql);
    //в данном случае пагинация только для пагинации, данные получаем вручную
    $pagination = new Pagination($dataBase, $cacheName, ['page' => $page, 'limit' => $limit, 'asArray' => true]);

    $dependencyName = 'account_bonuses' . \Yii::$app->user->id;
    $dependency = new yii\caching\DbDependency;
    $dependency->sql = 'select `last_update` from `cw_cache` where `name` = "' . $dependencyName . '"';
    
    $cacheName = 'account_bonuses' . \Yii::$app->user->id . '_' . $page;
    $sql .= 'limit ' . $pagination->offset() . ',' . $limit;
      $data['bonuses'] = Yii::$app->cache->getOrSet(
          $cacheName,
          function () use ($sql) {
              $payStatus = \Yii::t('dictionary', 'pay_status');
              $bonuses = Yii::$app->db->createCommand($sql)->queryAll();
              foreach ($bonuses as &$bonus) {
                  $payment = Payments::find()
                      ->from(Payments::tableName() . ' cwp')
                      ->select(['cwp.action_id as action_id', 'cwp.order_price as order_price', 'cwp.user_id as ref_id',
                          'cwp.order_id as order_id', 'cws.name as shop_name', 'cws.route as shop_route',
                          'cws.currency as shop_currency'])
                      ->innerJoin(CpaLink::tableName() .
                          ' cwl', 'cwp.affiliate_id = cwl.affiliate_id AND cwp.cpa_id=cwl.cpa_id')
                      ->innerJoin(Stores::tableName() . ' cws', "cwl.stores_id=cws.uid")
                      ->where(['cwp.uid' => $bonus['payment_id']])
                      ->asArray()
                      ->one();
                  if ($payment) {
                      $bonus = array_merge($bonus, $payment);
                  } else {
                      $bonus = array_merge($bonus, ['order_id' => 0, 'shop_name' => '']);
                  }
                  $bonus['amount'] = number_format($bonus['amount'], 2, '.', '');
                  //$bonus['type']=$notification_type[$bonus['type_id']];
                  $bonus['text'] = Yii::$app->messageParcer->notificationText($bonus);
                  $bonus['title'] = Yii::$app->messageParcer->notificationTitle($bonus);
                  $bonus['status_title'] = $payStatus[$bonus['status']];
              }
              return $bonuses;
          },
          Yii::$app->cache->defaultDuration,
          $dependency);

    if ($pagination->pages() > 1) {
      $data["pagination"] = $pagination->getPagination('bonuses/account', []);
    }

    return $this->render('index', $data);
  }

}