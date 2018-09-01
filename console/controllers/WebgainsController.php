<?php

namespace console\controllers;


use yii\console\Controller;
use Yii;
use common\models\Webgains;
use frontend\modules\stores\models\Cpa;
//use frontend\modules\stores\models\CpaLink;
use frontend\modules\stores\models\Stores;

class WebgainsController extends Controller
{

    private $cpa_id;

    private $records=0;
    private $inserted=0;
    private $storesFails=0;
    private $cpaLinkInserted=0;
    private $cpaLinkErrors=0;
    private $affiliateList = [];

    public function init()
    {
        $cpa = Cpa::find()->where(['name' => 'Webgains'])->one();
        if (!$cpa) {
            echo "Cpa Webgains not found";
            return;
        }
        $this->cpa_id = $cpa->id;
    }

    public function actionStores()
    {
        $service = new Webgains();
        $campaignId = $service->config['compaingId'];
        $response = $service->programs();

        if (isset($response['data'])) {
            foreach ($response['data'] as $store) {
                $this->records++;
                $programId = (string) $store['id'];
                $storeDetails = $service->getStoreDetails($programId);
                $affiliateId = $programId;
                $this->affiliateList[] = $affiliateId;
                $storeDb = [
                    'logo' => $storeDetails['image'],
                    'cpa_id' => $this->cpa_id,
                    'affiliate_id' => $affiliateId,
                    'url' => $storeDetails['url'],
                    'name' => (string) $store['name'],
                    'currency' => 'GBR',
                    'cashback' => $this->getCashback($store['commissionString']),
                    'hold_time' => 30,
                    'description' => (string) $store['description'],
                    'status' => 1,
                    'affiliate_link' => 'https://track.webgains.com/click.html?wgcampaignid=' . $campaignId .
                        '&wgprogramid=' . $programId,
                ];
                //d($storeDb);
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
            LEFT JOIN cw_cpa_link cpl on cpl.cpa_id=" . $this->cpa_id . " AND cws.`active_cpa`=cpl.id
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

    /**
     * приводим кэшбэк к виду
     * @param $data
     * @return string
     */
    private function getCashback($data)
    {
        $dataArr = explode('-', $data);
        $result = count($dataArr) == 2 ? 'до ' : '';
        $data = isset($dataArr[1]) ? $dataArr[1] : $data;
        $value = (float) preg_replace('/[^0-9\.\,]/', '', $data) / 2;
        $result = $result . $value . (strpos($data, '%') !== false ? '%' : '');
        return $result;
    }


}