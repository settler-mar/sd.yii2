<?php

namespace console\controllers;

use common\models\Ozon;
use common\models\Booking;
use yii\console\Controller;
use frontend\modules\users\models\Users;
use frontend\modules\stores\models\Stores;
use frontend\modules\payments\models\Payments;
use yii\helpers\Console;
use Yii;

class OrdersController extends Controller
{
    private $users;
    private $store;

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
    private function getStore($route)
    {
        if (!$this->store) {
            $this->store = Stores::find()->where(['route' => $route])->one();
        }
        return $this->store;
    }

    /**
     * платежи с озон
     */
    public function actionOzon()
    {
        $users = [];
        $ozon = new Ozon();
        $stat = $ozon->getOrders(time() - 60 * 60 * 24 * 30);
        ddd($stat);
        $store = $this->getStore('ozon'); //роут уточнить
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

        SimpleXMLElement (3) (
    public DateFrom -> string (18) "07.05.2018 0:00:00"
    public DateTo -> string (18) "06.06.2018 9:41:21"
    public Stats -> SimpleXMLElement (1) (
        public OrderItem -> SimpleXMLElement (15) (
            public ItemId -> string (9) "141198386"
            public Name -> string UTF-8 (82) "╨У╨╛╤А╤И╨╛╨║ ╨┤╨╗╤П ╤Ж╨▓╨╡╤В╨╛╨▓ ╨Ь╨╡╨│╨░╨
┐╨╗╨░╤Б╤В "╨Ъ╨▓╨░╨┤╤А╨░╤В", ╤Б ╨┐╨╛╨┤╨┤╨╛╨╜╨╛╨╝, ╤Ж╨▓╨╡╤В: ╨▒╨╕╤А╤О╨╖╨╛╨▓╤Л╨╣ ╨┐╨╡╤А╨╗╨░
╨╝╤Г╤В╤А, 10 ╨╗"
            public State -> string (4) "done"
            public Summ -> string (4) "8.88"
            public AgentId -> string (5) "63381"
            public StateChangeMoment -> string (19) "05.06.2018 14:56:46"
            public LinkDirect -> string (1) "0"
            public IsElectronics -> string (1) "0"
            public PostingId -> string (8) "68955523"
            public Price -> string (3) "355"
            public Qty -> string (1) "1"
            public Date -> string (19) "04.06.2018 15:09:12"
            public StatIdent -> string (17) "12797612879517960"
            public Type -> string UTF-8 (19) "╨Т╤Б╨╡ ╨┤╨╗╤П ╨┤╨╛╨╝╨░ ╨╕ ╨┤╨░╤З╨╕"
            public IsClientNew -> string (5) "false"
        )
    )
)

        */
        foreach ($stat as $order) {
            $user = $this->getUserData($order->AgentId);
            if (!in_array($user->uid, $users)) {
                $users[] = $user->uid;
            }
            //подогнать под формат платёжа с адмитад пока предварительно !!!!
            $payment = [
                'status' => $order->status == 'done' ? 2 : ($order->status == 'canceled' ? 1 : 0),
                'subid' => $order->AgentId,
                'positions' => false, //для тарифа, видимо так
                'action_id' => $order->ItemId, //или StatIdent - пока непонятно
                'cart' => (float)$order->Price * ($order->Qty ? (int) $order->Qty : 1),
                'payment' => $order->Summ,//(float)$order->Price * ($order->Qty ? (int) $order->Qty : 1),
                'click_date' => date('Y-m-d H:i:s', strtotime($order->Date)),
                'action_date' => date('Y-m-d H:i:s', strtotime($order->Date)),
                'status_updated' => date('Y-m-d H:i:s', strtotime($order->StateChangeMoment)),
                'closing_date' => date('Y-m-d H:i:s', strtotime($order->StateChangeMoment)), //??
                'product_country_code' => null, // а может сюда StatIdent ??
                'order_id' => $order->StatIdent,// тоже под вопросом??
                'tariff_id' => null,
                'currency' => 'RUB',
                'advcampaign_id' => $store->cpaLink->affiliate_id,
                'cpa_id' => $store->cpaLink->cpa_id
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