<?php

namespace console\controllers;


use yii\console\Controller;
use Yii;
use common\models\Awin;
use frontend\modules\stores\models\Cpa;
//use frontend\modules\stores\models\CpaLink;
use frontend\modules\stores\models\Stores;

class AwinController extends Controller
{

    private $cpa;
    private $userId;

    private $records=0;
    private $inserted=0;
    private $storesFails=0;
    private $cpaLinkInserted=0;
    private $cpaLinkErrors=0;
    private $affiliateList = [];

    public function actionStoresNew()
    {
        $service = new Awin();
        $stores = $service->getProgrammes();
        foreach ($stores as $store) {
            d($store);
            $commissions = $service->getCommissions(['advertiserId' => $store['id']]);
            $details = $service->getProgramDetails(['advertiserId' => $store['id']]);

            d($commissions, $details);
        }
    }


    public function actionStores()
    {
        $this->cpa = Cpa::find()->where(['name' => 'Awin'])->one();
        if (!$this->cpa) {
            echo "Cpa Awin not found";
            return;
        }
        $this->userId = isset(Yii::$app->params['awin']['user']) ? Yii::$app->params['awin']['user'] : false;
        if (!$this->userId) {
            ddd('Нет настройки "user" для Awin');
        }

        $service = new Awin();

        $response = $service->getAffiliates();
        if (count($response->merchant)) {
            $this->records = count($response->merchant);
            foreach ($response->merchant as $store) {
                $attributes = $store->attributes();
                $this->affiliateList[] = (string) $attributes['id'];
                $storeDb = [
                    'logo' => (string) $store->logo,
                    'cpa_id' => $this->cpa->id,
                    'affiliate_id' => (string) $attributes['id'],
                    'url' => (string) $store-> displayurl,
                    'name' => (string) $attributes['name'],
                    'currency' => "USD", //пока непонятно
                    'cashback' => 'до 1%',//пока нет
                    'hold_time' => 30,
                    'description' => (string) $store->description,
                    'status' => 1,
                    'affiliate_link' => (string) $store->clickthrough, //это один вариант, есть второй
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

    public function actionPayments($options = false)
    {
        $dateFrom = !empty($options['status_updated_start']) ? $options['status_updated_start'] : false;
        $dateTo = !empty($options['status_updated_end']) ? $options['status_updated_end'] : false;
        $service = new Awin();
        d($service->getPayments($dateFrom, $dateTo));
    }

}