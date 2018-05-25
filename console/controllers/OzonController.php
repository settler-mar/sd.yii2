<?php

namespace console\controllers;

use common\models\Ozon;
use yii\console\Controller;
use frontend\modules\users\models\Users;
use frontend\modules\stores\models\Stores;
use frontend\modules\payments\models\Payments;
use yii\helpers\Console;
use Yii;

class OzonController extends Controller
{
    private $users;

    /**
     * @param $user_id
     * @return mixed
     *
     * Получаем данные пользователя
     */
    private function getUserData($user_id)
    {
        if (!isset($this->users[$user_id])) {
            $user = Users::findOne(['uid' => $user_id]);
            if ($user) {
                $this->users[$user_id] = $user;
            } else {
                $this->users[$user_id] = false;
            }
        }
        return $this->users[$user_id];
    }

    /**
     * store, в данном случае это один шоп??
     * @return array|mixed|null|\yii\db\ActiveRecord
     */
    private function getStore()
    {
        if (!$this->store) {
            $this->store = Stores::find()->where(['route' => 'ozon.ru'])->one(); //видимо так ??????!!!!
        }
        return $this->store;
    }


    /**
     * платежи с озон
     */
    public function actionOrders()
    {
        $users = [];
        $ozon = new Ozon();
        $stat = $ozon->getOrders(time() - 60 * 60 * 24 * 30);
        ddd($stat);
        /*
        ItemID ID товара в заказе string ID товара в заказе
        Name Название string Название
        State Статус done Выполнен canceled Аннулирован
        Summ Комиссия string Потенциальная или начисленная комиссия партнера
        AgentId Значение субаккаунта string Суб-аккаунт
        StateChangeMoment Дата и время изменения статуса заказа string Дата в формате: dd.mm.yyyy hh:mm:ss
        LinkDirect Прямая ссылка 0 Нет 1 Да
        IsElectronics Товар категории 0 Нет «Электроника» 1 Да
        PostingId ID части заказа string Уникальный идентификатор отправления (части заказа) в системе.
        Price Цена string Цена за 1 экземпляр товара
        Qty Количество string Количество экземпляров
        Date Дата и время оформления заказа string Формат: dd.mm.yyyy hh:mm:ss
        StatIdent Идентификатор позиции заказа string Уникальный идентификатор товара в каждом конкретном заказе клиента.   Позволяет точно определять перемещение из принятых к обработке в выполненные.
        */
        foreach ($stat as $order) {
            $user = $this->getUserData($order->AgentId);
            if (!in_array($user->uid, $users)) {
                $users[] = $user->uid;
            }
            $store = $this->getStore();
            //подогнать под формат платёжа с адмитад пока предварительно !!!!
            $payment = [
                'status' => $order->status == 'done' ? 2 : ($order->status == 'canceled' ? 1 : 0),
                'subid' => $order->AgentId,
                'position' => false, //для тарифа, видимо так
                'action_id' => $order->ItemId, //или StatIdent - пока непонятно
                'card' => (float)$order->Price * ($order->Qty ? (int) $order->Qty : 1),
                'payment' => (float)$order->Price * ($order->Qty ? (int) $order->Qty : 1),
                'reward' => $order->Summ,//комиссия
                'cashback' => (float)$order->Summ / 2, //кэшбэк
                'click_date' => date('Y-m-d H:i:s', strtotime($order->Date)),
                'action_date' => date('Y-m-d H:i:s', strtotime($order->Date)),
                'status_updated' => date('Y-m-d H:i:s', strtotime($order->StateChangeMoment)),
                'closing_date' => date('Y-m-d H:i:s', strtotime($order->StateChangeMoment)), //??
                'product_country_code' => null, // а может сюда StatIdent ??
                'order_id' => $order->StatIdent,// тоже под вопросом??
                'tariff_id' => null,
                'currency' => 'RUB',
            ];
            $paymentStatus = Payments::makeOrUpdate(
                $payment,
                $store,
                $user,
                $user->referrer_id ? $this->getUserData($user->referrer_id) : null,
                ['notify' => true, 'email' => true]
            );


        }
        if (count($users) > 0) {
            Yii::$app->balanceCalc->setNotWork(false);
            Yii::$app->balanceCalc->todo($users, 'cash,bonus');
        }
    }
}