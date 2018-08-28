<?php

namespace console\controllers;


use common\models\Linkconnector;
use yii\console\Controller;
use Yii;
use frontend\modules\stores\models\Cpa;
//use frontend\modules\stores\models\CpaLink;
use frontend\modules\stores\models\Stores;
use frontend\modules\stores\models\CpaLink;
use frontend\modules\coupons\models\Coupons;

class LinkconnectorController extends Controller
{

    private $cpa;
    private $siteId;

    private $records = 0;
    private $inserted = 0;
    private $storesFails = 0;
    private $cpaLinkInserted = 0;
    private $cpaLinkErrors = 0;
    private $affiliateList = [];
    private $stores;
    private $coupons = 0;
    private $couponsInserted = 0;
    private $couponsErrors = 0;
    private $couponsNotStore = 0;

    public function beforeAction($action)
    {
        $this->cpa = Cpa::find()->where(['name' => 'Linkconnector'])->one();
        if (!$this->cpa) {
            echo "Cpa Linkconnector not found";
            return;
        }
        return parent::beforeAction($action);
    }

    /**
     * Получает наш id магазина по id от адмитада
     */
    private function getStore($adm_id)
    {
        if (!isset($this->stores[$adm_id])) {
            $cpaLink = CpaLink::findOne(['cpa_id' => $this->cpa->id, 'affiliate_id' => $adm_id]);
            if ($cpaLink) {
                $this->stores[$adm_id] = $cpaLink->store;
            } else {
                $this->stores[$adm_id] = false;
            }
        }
        return $this->stores[$adm_id];
    }

    /*
     * Получение магазинов
     */
    public function actionStores()
    {
        $service = new Linkconnector();
        $config = isset(Yii::$app->params['linkconnector']) ? Yii::$app->params['linkconnector'] : false;

        $response = $service->getAffiliates();
        if (count($response)) {
            $this->records = count($response);
            foreach ($response as $store) {
                $this->affiliateList[] = (string)$store['CampaignID'];
                $link = isset($store['DeepLinkURL']) ? $store['DeepLinkURL'] :
                    'https://www.linkconnector.com/ta.php?lc='.$config['user_id']. '00001200'.
                    (string)$store['CampaignID'].'&url='.(string)$store['MerchantURL'] ;
                if (isset($store['cashback'])) {
                    $cashback = (string) $store['cashback'];
                } else {
                    $cashbacks = explode(',', $store['Events'])[0];
                    $cashback = str_replace('Sale ', '', $cashbacks);
                }

                $storeDb = [
                    'logo' => (string)$store['BannerLogo'],
                    'cpa_id' => $this->cpa->id,
                    'affiliate_id' => (string)$store['CampaignID'],
                    'url' => (string)$store['MerchantURL'],
                    'name' => (string)$store['CampaignName'],
                    'currency' => "USD", //пока непонятно
                    'cashback' => $cashback,
                    'hold_time' => 30,
                    'description' => (string)$store['HTMLDescription'],
                    'status' => 1,
                    'affiliate_link' => $link,
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

        echo 'Stores ' . $this->records . "\n";
        if (!empty($this->storesFails)) {
            echo 'Errors ' . $this->storesFails . "\n";
        }
        echo 'Inserted ' . $this->inserted . "\n";
        echo 'Inserted Cpa link ' . $this->cpaLinkInserted . "\n";
        if (!empty($this->cpaLinkErrors)) {
            echo 'Errors ' . $this->cpaLinkErrors . "\n";
        }
    }


    /*
   * Получение купонов
   */
    public function actionCoupons()
    {

        $service = new Linkconnector();

        $response = $service->getСoupons();
        foreach ($response as $coupon) {
            //d($coupon);
            $store = $this->getStore($coupon['CampaignID']);
            if (!$store) {
                $this->couponsNotStore++;
                echo 'Store not found ' . $coupon['CampaignName'] . ' ' . $coupon['CampaignID'] . "\n";
                continue;
            }
            $this->coupons++;
            $promoCode = in_array($coupon['Coupon Code'], ['None Required' , 'No Code Needed']) ? '' :
                $coupon['Coupon Code'];

            $newCoupon = [
                'promocode' => $promoCode,
                'coupon_id' => $coupon['PromoID'],
                'store_id' => $store->uid,
                'name' => $coupon['HeadLineTitle'],
                'description' => null,
                'link' => $coupon['TrackingURL'],
                'date_start' => $coupon['Entry Date'],
                'date_expire' => $coupon['Expires'] == 'Never' ? '' : $coupon['Expires'],
                'cpa_id' => $this->cpa->id,
            ];
            $result = Coupons::makeOrUpdate($newCoupon);
            if ($result['new']) {
                $this->couponsInserted++;
            }
            if (!$result['status']) {
                $this->couponsErrors++;
                d($newCoupon, $result['coupon']->errors);
            }

        }
        echo 'Coupons ' . $this->coupons . "\n";
        echo 'Inserted ' . $this->couponsInserted . "\n";
        if (!empty($this->couponsNotStore)) {
            echo 'Store for coupon not found ' . $this->couponsNotStore . "\n";
        }
        if (!empty($this->couponsErrors)) {
            echo 'Errors ' . $this->couponsErrors . "\n";
        }
    }

    public function actionPayments()
    {

        $service = new Linkconnector();

        $response = $service->getTransactions();

        ddd($response);
    }
}