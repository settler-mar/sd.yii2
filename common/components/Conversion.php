<?php

namespace common\components;

use yii;
use yii\base\Component;

/**
 * Class Conversion
 * @package common\components
 */
class Conversion extends Component
{
  /**
   * @var
   */
  public $cache_duration;
  /**
   * варианты для select, будет добавлен RUB
   * @var array
   */
  public $options = [];
  /**
   * все курсы
   * @var null
   */
  private $data = null;

  /**
   * курсы для select
   * @var null
   */
  private $dataOptions = null;

  /**
   * @return mixed
   */
  public function init()
  {
    $cources = Yii::$app->cache->getOrSet('conversion_cources', function () {
      try {
        $xml = simplexml_load_file('http://www.cbr.ru/scripts/XML_daily.asp');
        $data2[] = [
          'code' => 'RUB',
          'value' => strval(1),
        ];
        $data = [];
        if (isset($xml->Valute)) {
          foreach ($xml->Valute as $valute) {
            $data[strval($valute->CharCode)] =
              (floatval(str_replace(",", ".", strval($valute->Value))) / intval($valute->Nominal));
            if (in_array(strval($valute->CharCode), $this->options)) {
              $data2[] = [
                'code' => strval($valute->CharCode),
                'value' => (floatval(str_replace(",", ".", strval($valute->Value)))
                  / intval($valute->Nominal)),
              ];
            }

          }
        }
        return ['data' => $data, 'dataOptions' => $data2];
      } catch (\Exception $e) {
        return ['data' => [], 'dataOptions' => []];
      }
    }, $this->cache_duration);
    $this->data = $cources['data'];
    $this->dataOptions = $cources['dataOptions'];
  }

  /**
   * @return null
   */
  public function options()
  {
    return $this->dataOptions;
  }

  /**
   * @param $amount
   * @param $from
   * @return null
   */
  public function getRUB($amount, $from)
  {
    $from = (string)$from;
    $amount = (float)$amount;

    if ($from == 'RUB') {
      return $amount;
    }
    return isset($this->data[$from]) ? $this->data[$from] * $amount : null;
  }
}
