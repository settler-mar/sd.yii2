<?php

namespace console\controllers;


use yii\console\Controller;
use yii\helpers\Console;
use Yii;
use common\models\Shareasale;
use frontend\modules\stores\models\Cpa;
use frontend\modules\stores\models\CpaLink;
use frontend\modules\stores\models\Stores;

class ShareasaleController extends Controller
{

    private $cpa_id;

    public function init()
    {
        $cpa = Cpa::find()->where(['name' => 'Shareasale'])->one();
        if (!$cpa) {
            echo 'Cpa type Shareasale not found';
            return;
        }
        $this->cpa_id = $cpa->id;
    }

    /**
     * Получение платежей
     */
    public function actionPayments()
    {
        //
    }

    /**
     * получение шопов
     */
    public function actionStore()
    {
        $ids = [];
        $affiliate_list = [];
        $records = 0;
        $inserted = 0;
        $cpalinkInserted = 0;
        $storesFails = 0;
        $cpalinkErrors =0;

        $shareasale = new Shareasale();
        $merchants = $shareasale->getJoinedMerchants();

        foreach ($merchants as $merchant) {
            $ids[] = $merchant->merchantid;
        }

        while (!empty($ids)) {
            //разбиваем массив ид на части, делаем запрос по частям чтобы не превысить длину get
            $idsPart = array_slice($ids, 0, 50);
            $ids = array_diff($ids, $idsPart);

            $merchantDetails = $shareasale->getMerchantsDetails(implode(',', $idsPart));

            foreach ($merchantDetails as $store) {
                $records++;
                $affiliate_id = (string) $store->merchantid;
                $affiliate_list[] = $affiliate_id;
                $cashback = $store->salecomm;
                $value = (float) preg_replace('/[^0123456789\.\,]/', '', $cashback) / 2;
                $cashbackClean = $value . (strpos($cashback, '%') > 0 ? '%' : '');
                $newStore = [
                    'cpa_id' => $this->cpa_id,
                    'affiliate_id' => $affiliate_id,
                    'url' => (string) $store->www,
                    'name' => (string) $store->merchant,
                    'currency' => 'USD',
                    'cashback' => $cashbackClean,
                    'hold_time' => 30,
                    'status' => 1,
                    'affiliate_link' => (string) $store->linkurl,
                ];
                $result = Stores::addOrUpdate($newStore);

                if (!$result['result']) {
                    $storesFails++;
                }
                if ($result['new']) {
                    $inserted++;
                }
                if ($result['newCpa']) {
                    $cpalinkInserted++;
                    if (!$result['resultCpa']) {
                        $cpalinkErrors++;
                    }
                }
            }
        }
        if (!empty($affiliate_list)) {
            $sql = "UPDATE `cw_stores` cws
            LEFT JOIN cw_cpa_link cpl on cpl.cpa_id=" . $this->cpa_id . " AND cws.`active_cpa`=cpl.id
            SET `is_active` = '0'
            WHERE cpl.affiliate_id NOT in(" . implode(',', $affiliate_list) . ") AND is_active!=-1";
            Yii::$app->db->createCommand($sql)->execute();
        }
        echo 'Stores '.$records."\n";
        echo 'Inserted '.$inserted."\n";
        if (!empty($errors)) {
            echo 'Stores fails '.$errors."\n";
        }
        echo 'Inserted Cpa link '.$cpalinkInserted."\n";
        if (!empty($cpalinkErrors)) {
            echo 'Cpa link fails '.$cpalinkErrors."\n";
        }
    }


}