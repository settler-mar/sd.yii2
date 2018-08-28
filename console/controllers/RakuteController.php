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
    private $cpa;
    private $siteId;
    private $cpaLinkInserted;

  public function init()
  {
    $this->cpa = Cpa::find()->where(['name' => 'Rakuten'])->one();
    if (!$this->cpa) {
      echo "Cpa Rakuten not found";
      return;
    }
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
                    LEFT JOIN cw_cpa_link cpl on cpl.cpa_id=" . $this->cpa->id . " AND cws.`active_cpa`=cpl.id
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
        $this->cpa = Cpa::find()->where(['name' => 'Rakuten'])->one();
        if (!$this->cpa) {
            echo "Cpa Rakuten not found";
            return;
        }
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
        }
        $route = Yii::$app->help->str2url($merchant['merchantname']);

        $logoFile = 'http://merchant.linksynergy.com/fs/logo/link_'.$merchant['mid'].'.jpg';
        $logo = explode(".", $logoFile);
        $logo = 'cw2_' . $route . '.' . $logo[count($logo) - 1];
        $logo = str_replace('_', '-', $logo);


        $affiliate_id = $merchant['mid'];
        $this->affiliate_list[] = $affiliate_id;
        $merchant['currency'] = 'USD';
        $merchant['name'] = $merchant['merchantname'];
        //$status = $merchant['applicationStatus'] == 'Approved' ? 1 : 0;
        $status = 1;

        $cpa_link = CpaLink::findOne(['cpa_id' => $this->cpa->id, 'affiliate_id' => $affiliate_id]);

        $cpa_id = false;

        if ($cpa_link) {
            //если CPA link нашли то проверяем ссылку и при необходимости обновляем ее
            if ($cpa_link->affiliate_link != $linkurl) {
                $cpa_link->affiliate_link = $linkurl;
                $cpa_link->save();
            }

            $cpa_id = $cpa_link->id;

            //переходим от ссылки СПА на магазин
            $db_store = $cpa_link->store;
                if ($db_store && ($db_store->logo == $logo || !$db_store->logo)) {
                    $test_logo = true;
                } else {
                    $test_logo = false;
                }
        } else {
            $db_store = false;
                    $test_logo = true;
        }

        $is_new = false; //метка если более выский уровень вновь созданный


        //если лого то проверяем его наличие и при нобходимости обновляем
        if ($test_logo) {
            //проверяем лого на папки
            $path = Yii::$app->getBasePath() . '/../frontend/web/images/logos/';
            if (!file_exists($path)) {
                mkdir($path, 0777, true);
            }
            //проверяем лого на наличие
            if (!file_exists($path . $logo)) {
                $file = file_get_contents($logoFile);
                $image = new Image($file);
                $image->bestFit(192, 192);
                $image->saveAs($path . $logo);
                //file_put_contents($path . $logo, $file);
            }
        }

        //если магазин не нашли по прямому подключению пробуем найти по косвеным признакам

        //поиск по ссылке на роуту
        if (!$db_store) {
            $db_store = Stores::find()->where(['route' => $route])->one();
        }

        //Если магазин так и не нашли то создаем
        if (!$db_store) {
            $db_store = new Stores();
            $db_store->name = $merchant['merchantname'];
            $db_store->route = $route;
            $db_store->is_active = $status;
            $db_store->url = '';
            $db_store->logo = $logo;
            $db_store->currency = 'USD';//$store['currency'];
            $db_store->hold_time = 30;//$store['max_hold_time'] ? (int)$store['max_hold_time'] : 30;
            $db_store->percent = 50;
           // $db_store->displayed_cashback = $cashbackClean;
            if (!$db_store->save()) {
                d($db_store->errors);
            } else {
                $this->inserted++;
            }
        } elseif ($test_logo && !empty($logo)) {
                //если нашли, но лого нужно обновить, то обновляем
            $db_store->logo = $logo;
        }

        $store_id = $db_store->uid;

        //если нет в базе CPA ЛИНК то создаем ее
        if (!$cpa_id) {
            echo "new cpalink\n";
            $cpa_link = new CpaLink();
            $cpa_link->cpa_id = $this->cpa->id;
            $cpa_link->stores_id = $store_id;
            $cpa_link->affiliate_id = $affiliate_id;
            $cpa_link->affiliate_link = $linkurl;
            if (!$cpa_link->save()) {
                d($cpa_link->errors);
                return;
            }
            $this->cpaLinkInserted++;

            $cpa_id = $cpa_link->id;
            $is_new = true;
        } else {
            //проверяем свяль CPA линк и магазина
            if ($cpa_link->stores_id != $store_id) {
                $cpa_link->stores_id = $store_id;
                $cpa_link->save();
            }
            $is_new = false;
        }

        //если СPA не выбранна то выставляем текущую
        //echo $db_store->active_cpa.' '.$cpa_id."\n";
        if ((int)$db_store->active_cpa == 0 || empty($db_store->active_cpa)) {
            $db_store->active_cpa = $cpa_id;
        }

        //$db_store->displayed_cashback = $cashbackClean;

        //$db_store->url = '';

        if ($db_store->is_active != -1) {
            $db_store->is_active = 1;
        }
        $db_store->save();


    }

    /** запись купона
     * @param $coupon
     */
    private function writeCoupon($coupon) {
        $route = Yii::$app->help->str2url($coupon['advertisername']);
        $store = $this->getStore($route);
        if (!$store) {
            echo "Store ".$coupon['advertisername']." not found\n";
            return;
        }
        preg_match('/&offerid=(.*?)&/', $coupon['clickurl'], $matches);
        $couponId = str_replace('.', '', $matches[1]);

        $dbCoupon =  Coupons::find()->where(['store_id' => $store->uid, 'coupon_id' => $couponId])->one();
        if (!$dbCoupon) {
            $this->inserted++;
            $dbCoupon  = new Coupons();
            $dbCoupon->store_id = $store->uid;
            $dbCoupon->coupon_id = $couponId;
            $dbCoupon->cpa_id = $this->cpa->id;
        }
        $couponName = $coupon['offerdescription'];
        $couponNameArr = explode(':', $couponName);
        $dbCoupon->name = $couponNameArr[0];
        $dbCoupon->description = isset($couponNameArr[1]) ? $couponNameArr[1] : '';
        $dbCoupon->goto_link = str_replace('&subid=0', '', $coupon['clickurl']);
        $dbCoupon->date_start = $coupon['offerstartdate'];
        $dbCoupon->date_end = $coupon['offerenddate'];
        $dbCoupon->species = 0;
        $dbCoupon->exclusive = 0;
        if (!$dbCoupon->save()) {
            d($dbCoupon->errors);
        }
        $categories = isset($coupon['categories']) ?
            $this->getCategories($coupon['categories']) : [];
        foreach ($categories as $category) {
            $categoryCoupon = CouponsToCategories::find()
                ->where(['coupon_id' => $dbCoupon->uid, 'category_id' => $category])
                ->one();
            if (!$categoryCoupon) {
                $categoryCoupon = new CouponsToCategories();
                $categoryCoupon->coupon_id = $dbCoupon->uid;
                $categoryCoupon->category_id = $category;
                if (!$categoryCoupon->save()) {
                    d($categoryCoupon->errors);
                }
            }
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

    private function getStore($route)
    {
        if (!isset($this->stores[$route])) {
            $this->stores[$route] = Stores::find()->where(['route' => $route])->one();
        }
        return $this->stores[$route];
    }

}