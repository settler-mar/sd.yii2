<?php

namespace app\modules\api\controllers;

use b2b\modules\stores_points\models\B2bStoresPoints;
use frontend\modules\payments\models\Payments;
use frontend\modules\stores\models\Stores;
use frontend\modules\stores\models\StoresActions;
use frontend\modules\users\models\Users;
use yii\web\Controller;
use Yii;

class DefaultController extends Controller
{
  public function beforeAction($action)
  {
    // Выключаем возможность использования межсайтовых запросов
    Yii::$app->request->enableCsrfValidation = false;

    //return some value
    return true;
  }

  public function actionLogin()
  {
    $request = Yii::$app->request;
    if (!$request->post('regNumber')) {
      throw new \yii\web\ForbiddenHttpException('Просмотр данной страницы запрещен.');
      http_response_code(403);
      return false;
    }

    $point = B2bStoresPoints::find()
      ->where(['access_code' => $request->post('regNumber')])
      ->one();
    if (!$point) {
      http_response_code(200);
      return 'Не найдена торговая точка с этим номером.';
    }

    Yii::$app->session->set('point', $point->id);
    Yii::$app->session->set('store', $point->store_id);
    return 'OK';
  }

  public function actionCategories()
  {
    $store_id = Yii::$app->session->get('store');

    if (!$store_id && !$this->actionLogin()) {
      return 'Ошибка прав доступа';
    }

    if (!$store_id) {
      $store_id = Yii::$app->session->get('store');
    }

    $store = Stores::find()
      ->where(['uid' => $store_id])
      ->one();

    $cpa = $store->getCpaLink()->one();

    $cat_ist = $cpa->getStoreActions()->asArray()->all();
    $out = array();
    foreach ($cat_ist as $item) {
      $out[] = [
        $item['name'],
        $item['uid']
      ];
      //$out[]= '"'.$item['uid'].': '.str_replace('"',"\\\"",$item['name']).'"';
    }
    return json_encode([
      $store->cash_number,
      $out
    ]);
    //return implode(',',$out)."\n";
  }

  public function actionSave()
  {
    //Yii::$app->logger->add($_POST,'API_ANDROID_ADD_PAIMENT');
    $store_id = Yii::$app->session->get('store');

    if (!$store_id && !$this->actionLogin()) {
      return 'Ошибка прав доступа';
    }

    $request = Yii::$app->request;
    if (!$request->post('category')) {
      return 'Выберите категорию';
    }
    if (!$request->post('user_code')) {
      return 'Заполните данные пользователя';
    }
    if (!$request->post('sum')) {
      return 'Введите сумму покупки';
    }

    if (!$store_id) {
      $store_id = Yii::$app->session->get('store');
    }

    $store = Stores::find()
      ->where(['uid' => $store_id])
      ->one();
    $cpa = $store->getCpaLink()->one();

    if (!$cpa) {
      return 'Ошибка получения данных магазина';
    }

    if (!$request->post('order_number') && $store->cash_number != 1) {
      return 'Не заполнен № чека';
    }

    $action_id = (int)$request->post('category');

    $action = StoresActions::find()
      ->where([
        'uid' => (int)$action_id,
        'cpa_link_id' => $cpa->id
      ])
      ->one();

    if (!$action) {
      return 'Категория не доступна';
    }

    $tariff = $action->getTariffs()
      ->orderBy('uid')
      ->one();
    if (!$tariff) {
      return 'Ошибка получения данных категории товара';
    }

    $rates = $tariff->getRates()
      ->where(['<', 'date_s', date("Y-m-d H:i:s")])
      //->orderBy(['date_s DESC','uid'])
      ->one();
    if (!$rates) {
      return 'Не найденна ставка кешбека для данной категории';
    }

    $user = explode('-', trim($request->post('user_code')));
    if (mb_strtolower($user[0]) != 'sd' || count($user) != 2) {
      return 'Не верный формат идентификатора пользователя';
    }

    $user = (int)$user[1];

    $user = Users::find()
      ->where(['uid' => $user])
      ->one();

    if (!$user) {
      return 'Пользователь не найден';
    }

    $sum = str_replace(',', '.', trim($request->post('user_code')));
    if ($sum != (float)$sum || (float)$sum) {
      return 'Пользователь не найден';
    }

    $kurs = Yii::$app->conversion->getRUB(1, $store->currency);

    $sum = (float)$request->post('sum');
    if ($rates->is_percentage) {
      $reward = $sum * $rates->size * $kurs / 100;
      $cashback = $sum * $rates->our_size * $kurs / 100;
    } else {
      $reward = $rates->size;
      $cashback = $rates->our_size;
    }

    // просчет лояльности
    $loyalty_bonus = $user->loyalty_status_data['bonus'];
    $cashback = $cashback + $cashback * $loyalty_bonus / 100;

    $cashback = round($cashback, 2);
    $reward = round($reward, 2);

    $pay = new Payments();
    $pay->cpa_id = $cpa->cpa_id;
    $pay->store_point_id = (int)Yii::$app->session->get('point');
    $pay->click_date = date("Y-m-d H:i:s");
    $pay->action_date = date("Y-m-d H:i:s");
    $pay->status_updated = date("Y-m-d H:i:s");
    $pay->closing_date = date("Y-m-d H:i:s", strtotime("+" . $action->hold_time . " day"));
    $pay->action_id = time();
    $pay->additional_id = 0;
    $pay->affiliate_id = $cpa->id;
    $pay->is_showed = 1;
    $pay->status = 0;
    $pay->user_id = $user->uid;
    $pay->order_price = $sum;
    $pay->reward = $reward;
    $pay->cashback = $cashback;
    $pay->order_id = $store->cash_number != 1 ? $request->post('order_number') : (string)time();
    $pay->shop_percent = $store->percent;
    $pay->loyalty_status = $user->loyalty_status;
    $pay->kurs = $kurs;
    $pay->action_code = $action->uid;
    $pay->rate_id = $rates->uid;
    $pay->recalc_json=array(
      'action'=>(array)$action,
      'tariff'=>(array)$tariff,
      'rate'=>(array)$rates,
    );
    //Yii::$app->logger->add( $rates->uid,'API_ANDROID_ADD_PAIMENT');

    if ($user->referrer_id > 0) {
      $ref = $this->getUserData($user->referrer_id);
      $pay->ref_id = $user->referrer_id;
      $pay->ref_bonus_id = $ref->bonus_status;
      $ref_bonus_data = $ref->bonus_status_data;

      if (isset($ref_bonus_data['is_webmaster']) && $ref_bonus_data['is_webmaster'] == 1) {
        $pay->ref_bonus = ($reward - $cashback) * $ref_bonus_data['bonus'] / 100;
      } else {
        $pay->ref_bonus = $cashback * $ref_bonus_data['bonus'] / 100;
      }
      $pay->ref_bonus = round($pay->ref_bonus, 2);
    }

    if (!$pay->save()) {
      //var_dump($pay->getErrors());
      return 'Непредвиденная ошибка';
    }

    \Yii::$app->balanceCalc->todo($user->uid, 'cash');
    return 'OK';
  }

  public function actionMsg()
  {
    $request = Yii::$app->request;
    return $this->renderAjax('msg_ok', $request->get());
  }
}
