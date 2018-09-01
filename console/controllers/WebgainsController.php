<?php

namespace console\controllers;


use yii\console\Controller;
use Yii;
use common\models\Webgains;
use frontend\modules\stores\models\Cpa;
use frontend\modules\stores\models\CpaLink;
use frontend\modules\stores\models\Stores;
use frontend\modules\coupons\models\Coupons;

class WebgainsController extends Controller
{

    private $cpa_id;

    private $records=0;
    private $inserted=0;
    private $storesFails=0;
    private $errors = 0;
    private $cpaLinkInserted=0;
    private $cpaLinkErrors=0;
    private $affiliateList = [];
    private $stores;
    private $categoriesStores;
    private $categories = [];
    private $config;
    private $categoriesConfigFile;

    public function init()
    {
        $cpa = Cpa::find()->where(['name' => 'Webgains'])->one();
        if (!$cpa) {
            echo "Cpa Webgains not found";
            return;
        }
        $this->cpa_id = $cpa->id;

        $this->config = isset(Yii::$app->params['webgains']) ? Yii::$app->params['webgains'] : false;
        if (!$this->config) {
            ddd('Config Webgains not found');
        }
    }

    public function actionStores()
    {
        $service = new Webgains();
        $campaignId = $this->config['compaingId'];
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

    public function actionCoupons()
    {
        $service = new Webgains();
        //вначале шопы для получения категорий
        $response = $service->programs();
        if (isset($response['data'])) {
            foreach ($response['data'] as $store) {
                if (isset($store['categories']['short'])) {
                    $this->categoriesStores[$store['id']] = $store['categories']['short'];
                }
            }
        }
        //собственно купоны
        $response = $service->vouchers();
        //d($response);
        if (isset($response['data'])) {
            foreach ($response['data'] as $store) {
                $affilliateId = $store['program_id'];
                $storeDb = $this->getStore($affilliateId);
                if (!$storeDb) {
                    echo 'Store not found ' . $affilliateId  . "\n";
                    continue;
                }
                $categories = $this->getCouponCategories($this->categoriesStores[$affilliateId]);
                if (isset($store['vcDetails'])) {
                    $index = 0;
                    foreach ($store['vcDetails'] as $key => $coupon) {
                        $this->records++;
                        $newCoupon = [
                            'store_id' => $storeDb->uid,
                            'coupon_id' => $coupon['id'],
                            'name' => mb_strlen($coupon['discount']) > 10 ? $coupon['discount'] :
                                substr($coupon['description'], 0, 256) ,
                            'description' => $coupon['description'],
                            'promocode' => $key,
                            'date_start' => isset($store['grouped_vcStartDate_f'][$index]) ?
                                \DateTime::createFromFormat('d/m/Y', $store['grouped_vcStartDate_f'][$index])->format('Y-m-d 00:00:00') : '',
                            'date_expire' => isset($store['grouped_vcExpDate_f'][$index]) ?
                                \DateTime::createFromFormat('d/m/Y', $store['grouped_vcExpDate_f'][$index])->format('Y-m-d 00:00:00') : '',
                            'link' => $coupon['tracking_link'],
                            'categories' => $categories,
                            'cpa_id' => $this->cpa_id,
                            'language' => 'en',
                        ];
                        $result = Coupons::makeOrUpdate($newCoupon);
                        if ($result['new'] && $result['status']) {
                            $this->inserted++;
                        }
                        if (!$result['status']) {
                            $this->errors++;
                            d($newCoupon, $result['coupon']->errors);
                        }
                        $index++;
                    }
                }

            }
        }
        $this->saveCopuonCategory();
        echo "Coupons " . $this->records . "\n";
        echo "Inserted " . $this->inserted . "\n";
        if (!empty($this->errors)) {
            echo "Errors " . $this->errors . "\n";
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

    private function getStore($id)
    {
        if (!isset($this->stores[$id])) {
            $cpaLink = CpaLink::findOne(['cpa_id' => $this->cpa_id, 'affiliate_id' => $id]);
            if ($cpaLink) {
                $this->stores[$id] = $cpaLink->store;
            } else {
                $this->stores[$id] = false;
            }
        }
        return $this->stores[$id];
    }

    private function getCouponCategories($categories)
    {
        $result = [];
        $categories = explode(',', $categories);
        if (empty($categories)) {
            return $result;
        }
        if (!$this->categories) {
            $file = realpath(Yii::$app->basePath . '/../');
            $file .= $this->config['categories_json'];
            $this->categoriesConfigFile = $file;
            if (file_exists($file)) {
                $this->categories = json_decode(file_get_contents($file), true);
            } else {
                $this->categories = [];
            }

        }
        foreach ($categories as $category) {
            $category = trim($category);
            if (!empty($this->categories[$category])) {
                if (!empty($this->categories[$category]['id'])) {
                    $result[] = $this->categories[$category]['id'];
                }
            } else {
                //неизвестное значение - вписать в массив
                $this->categories[$category] = [
                    'name' => $category,
                ];
            }
        }
        return array_unique($result);
    }

    private function saveCopuonCategory()
    {
        if ($this->categoriesConfigFile) {
            file_put_contents($this->categoriesConfigFile, json_encode($this->categories));
        }
    }



}