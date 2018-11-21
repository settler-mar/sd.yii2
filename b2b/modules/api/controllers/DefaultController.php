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

    //$kurs = Yii::$app->conversion->getCurs($user->currency, $store->currency);

    $sum = (float)$request->post('sum');
    if ($rates->is_percentage) {
      //$reward = $sum * $rates->size * $kurs / 100;
      $reward = $sum * $rates->size / 100;
      //$cashback = $sum * $rates->our_size * $kurs / 100;
    } else {
      $reward = $rates->size;
      //$cashback = $rates->our_size;
    }

    // просчет лояльности
    //$loyalty_bonus = $user->loyalty_status_data['bonus'];
    //$cashback = $cashback + $cashback * $loyalty_bonus / 100;

    //$cashback = round($cashback, 2);
    $reward = round($reward, 2);

    $date = date("Y-m-d H:i:s");
    $payment = [
        'cpa_id' => $cpa->cpa_id,
        'affiliate_id' => $cpa->id,
        'subid' => $user->uid,
        'action_id' => time(),
        'status' => 0,
        'ip' => get_ip(),
        'currency' => $store->currency,//Валюта платежа
        'cart' => $sum,  //Сумма заказа в валюте
        'payment' => $reward,  //комиссия в валюте магазина
        'click_date' => $date,
        'action_date' => $date,
        'status_updated' => $date,
        'closing_date' => date("Y-m-d H:i:s", strtotime("+" . $action->hold_time . " day")),
        'order_id' => $store->cash_number != 1 ? $request->post('order_number') : (string)time(),
        "tariff_id" => null,
    ];

    $paymentStatus = Payments::makeOrUpdate(
        $payment,
        $store,
        $user,
        $user->referrer_id ? $this->getUserData($user->referrer_id) : null,
        ['notify' => true, 'email' => true]
    );


    if(!$paymentStatus['payment']){
      return 'Непредвиденная ошибка';
    }

    $action=$action->toArray();
    $tariff=$tariff->toArray();
    $rates=$rates->toArray();

    $recalc_json=[
      'action' => [
        'uid'=>$action['uid'],
        'name' => $action['name']
      ],
      'tariff' => [
        'uid'=>$tariff['uid'],
        'name' => $tariff['name']
      ],
      'rate' => $rates,
    ];
    $paymentStatus['payment']->recalc_json = json_encode($recalc_json);

    if (!$paymentStatus['payment']->save()) {
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
