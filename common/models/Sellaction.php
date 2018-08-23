<?php

namespace common\models;

use yii;

class Sellaction
{
  private $id;
  private $apiKey;
  private $siteId;//id площадки
  private $url = 'https://sellaction.net/api/';
  public $statuses = [
      '0' => 'ожидает',
      '1' => 'подтвержден',
      '2' => 'отменен',
      '3' => 'ожидает подтверждения',
      '4' => 'ожидает отмены',
      '5' => 'оплачен',
  ];

  public function __construct()
  {
    $config = Yii::$app->params['sellaction'];
    $this->id = $config && isset($config['id']) ? $config['id'] : '';
    $this->apiKey = $config && isset($config['apiKey']) ? $config['apiKey'] : '';
    $this->siteId = $config && isset($config['siteId']) ? $config['siteId'] : '';
  }

  public function test()
  {
    return $this->getRequest('actions');
  }

  public function lostOrders($page = 1, $limit = 500)
  {
    return $this->getRequest('actions', false, ['page' => $page, 'per-page' => $limit]);
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
    return $this->getRequest(
        'campaigns/my',
        false,
        ['site_id' => $this->siteId, 'page' => $page, 'per-page' => $limit]
    );
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
    $url = $this->url . $action . ($id ? '/' . $id : '') . ($query ? '?' . $query : '');

    $headers = ["Auth-Token:" . $this->apiKey, "Accept: application/json"];
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $returnResult = curl_exec($ch);
    curl_close($ch);
    return json_decode($returnResult, true);
  }

}