<?php

namespace console\controllers;


use common\models\Linkconnector;
use yii\console\Controller;
use Yii;
use frontend\modules\stores\models\Cpa;
//use frontend\modules\stores\models\CpaLink;
use frontend\modules\stores\models\Stores;

class LinkconnectorController extends Controller
{

  private $cpa;
  private $siteId;

  private $records=0;
  private $inserted=0;
  private $storesFails=0;
  private $cpaLinkInserted=0;
  private $cpaLinkErrors=0;
  private $affiliateList = [];

  public function beforeAction($action)
  {
    $this->cpa = Cpa::find()->where(['name' => 'Linkconnector'])->one();
    if (!$this->cpa) {
      echo "Cpa Linkconnector not found";
      return;
    }
    return parent::beforeAction($action);
  }

  /*
   * Получение магазинов
   */
  public function actionStores()
  {
    $service = new Linkconnector();

    $response = $service->getAffiliates();
    if ($response) {
      $this->records = count($response);
      foreach ($response as $store) {
        $this->affiliateList[] = (string) $store['CampaignID'];
        $storeDb = [
            'logo' => (string) $store['BannerLogo'],
            'cpa_id' => $this->cpa->id,
            'affiliate_id' => (string) $store['CampaignID'],
            'url' => (string) $store['MerchantURL'],
            'name' => (string) $store['CampaignName'],
            'currency' => "USD", //пока непонятно
            'cashback' => (string) $store['cashback'],
            'hold_time' => 30,
            'description' => (string) $store['HTMLDescription'],
            'status' => 1,
            'affiliate_link'=>(string) $store['DeepLinkURL'],
           // 'affiliate_link' => (string) $store->clickthrough, //это один вариант, есть второй
          //'affiliate_link' => 'https://www.awin1.com/cread.php?awinmid=' . (string) $attributes['id'] .
          //   '&awinaffid=' . $this->userId,//второй вариант
        ];
        $result = Stores::addOrUpdate($storeDb);

        if (!$result['result']) {
          $this->storesFails++;
        }
        if ($result['new']) {
          $this->inserted++;
        }
        if ($result['newCpa']) {
          $this->cpaLinkInserted++;
          if (!$result['resultCpa']) {
            $this->cpaLinkErrors++;
          }
        }
      }
    }

    if (!empty($this->affiliateList)) {
      $sql = "UPDATE `cw_stores` cws
            LEFT JOIN cw_cpa_link cpl on cpl.cpa_id=" . $this->cpa->id . " AND cws.`active_cpa`=cpl.id
            SET `is_active` = '0'
            WHERE cpl.affiliate_id NOT in(" . implode(',', $this->affiliateList) . ") AND is_active!=-1";
      Yii::$app->db->createCommand($sql)->execute();
    }

    echo 'Stores '.$this->records."\n";
    if (!empty($this->storesFails)) {
      echo 'Errors '.$this->storesFails . "\n";
    }
    echo 'Inserted '.$this->inserted."\n";
    echo 'Inserted Cpa link '.$this->cpaLinkInserted."\n";
    if (!empty($this->cpaLinkErrors)) {
      echo 'Errors '. $this->cpaLinkErrors. "\n";
    }
  }


  /*
 * Получение купонов
 */
  public function actionCoupons()
  {

    $service = new Linkconnector();

    $response = $service->getСoupons();
  }
}