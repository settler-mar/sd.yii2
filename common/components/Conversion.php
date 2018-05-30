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
    $path=Yii::$app->basePath.'/../common/config';
    $path=realpath($path).'/curs.php';

    if(!is_readable($path)){
      $cources= ['data' => [], 'dataOptions' => []];
    }else{
      $cources = require ($path);
    }

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

    if ($from == Yii::$app->params['valuta']) {
      return $amount;
    }
    return isset($this->data[$from]) ? $this->data[$from] * $amount : null;
  }

    /**
     * курс одной валюты к другой
     * @param $to
     * @param $from
     * @return float|int|null
     */
  public function getCurs($to, $from)
  {
    $from = (string)$from;
    $to = (string)$to;

    return isset($this->data[$from]) && !empty($this->data[$to]) ? $this->data[$from] / $this->data[$to]  : null;
  }

}
