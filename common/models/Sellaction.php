<?php

namespace common\models;

use yii;

class Sellaction
{
    private $id;
    private $apiKey;
    private $url = 'https://sellaction.net/api/';
    public $statuses =[
        '0' => 'ожидает',
        '1' => 'подтвержден',
        '2' => 'отменен',
        '3' => 'ожидает подтверждения',
        '4' => 'ожидает отмены',
        '5' => 'оплачен',
    ];

    public static function categories()
    {
        $result = [
            "8"  => "Красота и здоровье",
            "13" => "Мебель, товары для дома",
            "7 " => "Книги и диски",
            "15" => "Подарки, цветы",
            "42" => "Украшения",
            "14" => "Одежда, обувь, аксессуары",
            "30" => "Установочные",
            "17" => "Бытовая техника и электроника",
            "18" => "Спортивные товары",
            "63" => "Подтвержденный заказ",
            "60" => "Услуги",
            "29" => "Браузерные игры",
            "4"  => "Авто",
            "16" => "Товары для детей",
            "10" => "Пластиковые карты",
            "11" => "Кредиты",
            "32" => "Заказ билетов",
            "5"  => "Продукты питания",
            "40" => "Аксессуары",
            "50" => "Софт & Игры",
            "6"  => "Товары для животных",
            "19" => "Купонные сервисы",
            "49" => "Товары для творчества",
            "61" => "Строительство и ремонт",
            "33" => "Подбор туров",
            "25" => "Android",
            "62" => "Оплаченный заказ",
            "21" => "Мобильные сервисы",
            "22" => "Провайдеры",
            "45" => "Знакомства",
            "34" => "Бронирование отелей",
            "37" => "Бизнес",
            "44" => "Работа & Обучение",
            "9"  => "Депозиты",
        ];
        ksort($result);
        return $result;
    }



    public function __construct()
    {
        $config = Yii::$app->params['sellaction'];
        $this->id = $config && isset($config['id']) ? $config['id'] : '';
        $this->apiKey = $config && isset($config['apiKey']) ? $config['apiKey'] : '';
    }

    public function test()
    {
        return $this->getRequest('actions');
    }

    /**действия
     * @param $page
     * @param $limit
     * @return mixed
     */
    public function actions($page, $limit)
    {
        return $this->getRequest('actions', false, ['page' => $page, 'per-page' => $limit]);
    }

    /**компании
     * @param $page
     * @param $limit
     * @return mixed
     */
    public function campaigns($page, $limit)
    {
        //'campaigns/my'  - возможно этот метод, но возвращает 0
        return $this->getRequest('campaigns', false, ['page' => $page, 'per-page' => $limit]);
    }

    /** мои компании
     * @param $page
     * @param $limit
     * @return mixed
     */
    public function myCampaigns($page, $limit)
    {
        //'campaigns/my'  - возможно этот метод, но возвращает 0
        return $this->getRequest('campaigns/my', false, ['page' => $page, 'per-page' => $limit]);
    }

    /**
     * @param $action
     * @param bool $id
     * @param array $params
     * @return mixed
     */
    private function getRequest($action, $id = false, $params = [])
    {
        $query = http_build_query($params);
        $url = $this->url . $action . ($id ? '/'.$id : '') . ($query ? '?'.$query : '');

        $headers = ["Auth-Token:". $this->apiKey, "Accept: application/json"];
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $returnResult = curl_exec($ch);
        curl_close($ch);
        return json_decode($returnResult, true);
    }

}