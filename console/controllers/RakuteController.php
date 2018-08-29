<?php

namespace console\controllers;

use common\components\Help;
use common\models\Rakute;
use yii;
use yii\console\Controller;
use frontend\modules\stores\models\Stores;
use frontend\modules\stores\models\Cpa;
use frontend\modules\stores\models\CpaLink;
use frontend\modules\coupons\models\Coupons;
use frontend\modules\coupons\models\CouponsToCategories;
use JBZoo\Image\Image;

class RakuteController extends Controller
{

    private $affiliate_list;
    private $inserted = 0;
    private $coupons = 0;
    private $categories = [];
    private $categoriesConfigFile;
    private $stores;
    private $cpa_id;
    private $siteId;
    private $cpaLinkInserted;
    private $fails;
    private $failsCpaLink;

  public function init()
  {
    $cpa = Cpa::find()->where(['name' => 'Rakuten'])->one();
    if (!$cpa) {
      echo "Cpa Rakuten not found";
      return;
    }
    $this->cpa_id = $cpa->id;
  }

    public function actionTest()
    {
        $client = new Rakute();
        $data  = $client->merchantDetail(40842);
//        $dom = SHD::str_get_html($data);
//        $siteUrl = $dom->find('#website');
//        //$siteUrlHref = $siteUrl->getAttribute('href');
        ddd($data);
        //ddd($client->productSearch());

    }

    /**
     * шопы
     */
    public function actionStores()
    {
        $config = Yii::$app->params['rakute'];
        $this->siteId = isset($config['site_id']) ? $config['site_id'] : false;
        if (!$this->siteId) {
            echo 'Config site_id not found';
            return;
        }
        $client = new Rakute();
        $linkResponse = $links = $client->getTextLinksByID('-1/-1/01012018/'.date('mdY', time()).'/-1/1');
        //cсылки по шопам  - каждому с максимальной датой
        $links = [];
        if (isset($linkResponse['return'])) {
            foreach ($linkResponse['return'] as $link) {
                if (!isset($links[$link['mid']]) || !isset($links[$link['mid']]['endDate'])) {
                    $links[$link['mid']] = $link;
                } else {
                    $dateLink = strtotime($links[$link['mid']]['endDate']);
                    $dateLinkNew = strtotime($link['endDate']);
                    if ($dateLinkNew > $dateLink) {
                        $links[$link['mid']] = $link;
                    }
                }
            }
        }
        $merchants = $client->merchantList();
        if (isset($merchants['midlist']['merchant'])) {
            foreach ($merchants['midlist']['merchant'] as $merchant) {

                //нам отcюда нужен бы статус, но запрос в цикле не проходит - превышено количество запросов в минуту
                //$merchantDetail = $client->getMerchByID($merchant['mid']);

                //if (isset($merchantDetail['return'])) {
                    $storeLink = isset($links[$merchant['mid']]) ? $links[$merchant['mid']] : false;
                    //$this->writeStore($merchantDetail['return'], $storeLink);
                    $this->writeStore($merchant, $storeLink);
                //}
            }
            if (!empty($this->affiliateList)) {
                $sql = "UPDATE `cw_stores` cws
                    LEFT JOIN cw_cpa_link cpl on cpl.cpa_id=" . $this->cpa_id . " AND cws.`active_cpa`=cpl.id
                    SET `is_active` = '0'
                    WHERE cpl.affiliate_id NOT in(" . implode(',', $this->affiliateList) . ") AND is_active!=-1";
                \Yii::$app->db->createCommand($sql)->execute();
            }
            echo 'Stores '. count($merchants['midlist']['merchant'])."\n";
            echo 'Inserted '.$this->inserted."\n";
            echo 'CpaLink Inserted '.$this->cpaLinkInserted."\n";
        }
    }

    /**
     * купоны
     */
    public function actionCoupons()
    {
        $perPage = 100;
        $pageNumber = 1;
        $pageCount = 1;

        $client = new Rakute();

        do {
            $coupons = $client->getCoupons(['resultsperpage' => $perPage, 'pagenumber' => $pageNumber]);
            $pageCount = isset($coupons['TotalPages']) ? (int)$coupons['TotalPages'] : $pageCount;
            $pageNumber = isset($coupons['PageNumberRequested']) ? (int)$coupons['PageNumberRequested'] : $pageNumber;
            $pageNumber++;
            if (isset($coupons['link'])) {
                foreach ($coupons['link'] as $link) {
                    $this->coupons++;
                    $this->writeCoupon($link);
                }
            }

        } while ($pageNumber <= $pageCount);

        $this->saveCategories();
        echo 'Coupons '. $this->coupons."\n";
        echo 'Inserted '.$this->inserted."\n";
    }


    /**
     * запись шопа
     * @param $merchant
     * @param $link
     */
    private function writeStore($merchant, $link)
    {
        //d($merchant, $link);
        if ($link) {
            $linkArr = parse_url($link['landURL']);
            $siteUrl = $linkArr['scheme'].'://'.$linkArr['host'];
            $linkurl ="https://click.linksynergy.com/deeplink?id=".$this->siteId."&mid=".$merchant['mid']."&u1={{subid}}&murl=".$siteUrl;
        } else {
            $linkurl = '-';
            $siteUrl = '-';
        }
        $logoFile = 'http://merchant.linksynergy.com/fs/logo/link_'.$merchant['mid'].'.jpg';
        $affiliate_id = $merchant['mid'];
        $this->affiliate_list[] = $affiliate_id;

        $store = [
            'logo' => $logoFile,
            'cpa_id' => $this->cpa_id,
            'affiliate_id' => $affiliate_id,
            'url' => $siteUrl,
            'name' => $merchant['merchantname'],
            'currency' => 'USD',
            'cashback' => '',
            'hold_time' => 30,
            'status' => 1,
            'affiliate_link' => $linkurl,
        ];
        //d($store);
        $result = Stores::addOrUpdate($store);
        if (!$result['result']) {
            $this->fails++;
        }
        if ($result['new']) {
            $this->inserted++;
        }
        if ($result['newCpa']) {
            $this->cpaLinkInserted++;
            if (!$result['resultCpa']) {
                $this->failsCpaLink++;
            }
        }
    }

    /** запись купона
     * @param $coupon
     */
    private function writeCoupon($coupon)
    {
        //d($coupon);
        $store = $this->getStore($coupon['advertiserid']);
        if (!$store) {
            echo "Store ".$coupon['advertisername']." not found\n";
            return;
        }
        preg_match('/&offerid=(.*?)&/', $coupon['clickurl'], $matches);
        $couponId = str_replace('.', '', $matches[1]);
        $couponName = $coupon['offerdescription'];
        $couponNameArr = explode(':', $couponName);
        $newCoupon = [
            'store_id' => $store->uid,
            'coupon_id' => $couponId,
            'name' => $couponNameArr[0],
            'description' => isset($couponNameArr[1]) ? $couponNameArr[1] : '',
            'promocode' => '',
            'date_start' => $coupon['offerstartdate'],
            'date_expire' => $coupon['offerenddate'],
            'link' => str_replace('&subid=0', '', $coupon['clickurl']),
            'cpa_id' => $this->cpa_id,
            'exclusive' => 0,
            'categories' => isset($coupon['categories']) ?
                $this->getCategories($coupon['categories']) : [],
        ];

        $result = Coupons::makeOrUpdate($newCoupon);
        if ($result['new'] && $result['status']) {
            $this->inserted++;
        }
        if (!$result['status']) {
            d($coupon, $result['coupon']->errors);
        }

    }

    /**
     * получаем категории купонов
     * @param $categories
     * @return array
     */
    private function getCategories($categories)
    {
        if (!$this->categories) {
            $file = realpath(Yii::$app->basePath . '/../');
            $file .= Yii::$app->params['rakute']['categories_json'];
            $this->categoriesConfigFile = $file;
            if (file_exists($file)) {
                $this->categories = json_decode(file_get_contents($file), true);
            } else {
                $this->categories = [];
            }

        }
        $result = [];

        if (is_array($categories['category'])) {
            $cats = $categories['category'];
        } else {
            $cats = [$categories['category']];
        }
        foreach ($cats as $category) {
            if (!empty($this->categories[$category])) {
                $id = isset($this->categories[$category]['id']) ? $this->categories[$category]['id'] : false;
                if (is_array($id)) {
                    $result = array_merge($result, $id);
                } elseif ($id) {
                    $result[] = (integer)$id;
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

    //сохранение категорий купонов для настройки в конфиг
    private function saveCategories()
    {
        $categories = !empty($this->categories) ? json_encode($this->categories) : false;
        $fileArray = explode('/', $this->categoriesConfigFile);
        $filePath = implode('/', array_slice($fileArray, 0, count($fileArray) - 1));
        if (!file_exists($filePath)) {
            mkdir($filePath, 0777, true);
        }
        if ($categories && $this->categoriesConfigFile) {
            file_put_contents($this->categoriesConfigFile, $categories);
        }
    }

    private function getStore($affiliateId)
    {
        if (!isset($this->stores[$affiliateId])) {
            $cpaLink = CpaLink::findOne(['cpa_id' => $this->cpa_id, 'affiliate_id' => $affiliateId]);
            $this->stores[$affiliateId] = $cpaLink ? $cpaLink->store : false;
        }
        return $this->stores[$affiliateId];
    }

}