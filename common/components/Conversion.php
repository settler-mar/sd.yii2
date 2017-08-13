<?php

namespace common\components;

use yii;

/**
 * Class Conversion
 * @package common\components
 */
class Conversion
{

    private static $cache_duration = 7200;
    /**
     * все курсы
     * @var null
     */
    private static $data = null;

    /**
     * курсы для select
     * @var null
     */
    private static $dataOptions = null;

    /**
     * варианты для select, будет добавлен RUB
     * @var array
     */
    private static $options = ["USD", "EUR", "UAH", "KZT"];
    
    /**
     * @return mixed
     */
    private static function makeData()
    {
        if (!self::$data || !self::$dataOptions) {
            $cources = Yii::$app->cache->getOrSet('conversion_cources', function () {
                $xml =  simplexml_load_file('http://www.cbr.ru/scripts/XML_daily.asp');
                $data2[] = [
                    'code' => 'RUB',
                    'value' => strval(1),
                ];
                $data= [];
                if (isset($xml->Valute)) {
                    foreach ($xml->Valute as $valute) {
                        $data[strval($valute->CharCode)] =
                            (floatval(str_replace(",", ".", strval($valute->Value))) / intval($valute->Nominal));
                        if (in_array(strval($valute->CharCode), self::$options)) {
                            $data2[] = [
                                'code' => strval($valute->CharCode),
                                'value' => (floatval(str_replace(",", ".", strval($valute->Value)))
                                    / intval($valute->Nominal)),
                            ];
                        }

                    }
                }
                return ['data' => $data, 'dataOptions' => $data2];
            }, self::$cache_duration);
            self::$data = $cources['data'];
            self::$dataOptions = $cources['dataOptions'];
        }
    }

    /**
     * @return null
     */
    public static function options()
    {
        self::makeData();
        return self::$dataOptions;
    }

    /**
     * @param $amount
     * @param $from
     * @return null
     */
    public static function getRUB($amount, $from)
    {
        self::makeData();
        $from = (string)$from;
        $amount=(float)$amount;

        return isset(self::$data[$from]) ? self::$data[$from] * $amount : null;
    }
}
