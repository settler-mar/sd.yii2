<?php

namespace console\controllers;


use yii\console\Controller;
use Yii;
use common\models\Cj;
use frontend\modules\stores\models\Cpa;
use frontend\modules\stores\models\CpaLink;
use frontend\modules\stores\models\Stores;

class CjController extends Controller
{

    private $cpa;
    private $siteId;//наш ид в cj.com
    private $trackingServer = 'https://www.qksrv.net';
    private $records;
    private $inserted;
    private $cpaLinkInserted;
    private $affiliateList = [];


    public function actionStores()
    {
        $this->cpa = Cpa::find()->where(['name' => 'Cj.com'])->one();
        if (!$this->cpa) {
            echo "Cpa Cj.com not found";
            return;
        }
        $config = Yii::$app->params['cj.com'];

        $this->siteId = $config && isset($config['site_id']) ? $config['site_id'] : '';
        if (!$this->siteId) {
            echo "site_id in params not found";
            return;
        }


        $cj = new Cj();
        $page = 1;
        $pageCount = 1;
        $perPage = 100;
        do {
            $response = $cj->getJoined($page, $perPage);
            $page = isset($response['advertisers']['@attributes']['page-number']) ?
                $response['advertisers']['@attributes']['page-number'] : $page;
            $count = isset($response['advertisers']['@attributes']['records-returned']) ?
                $response['advertisers']['@attributes']['records-returned'] : 1;
            $all = isset($response['advertisers']['@attributes']['total-matched']) ?
                $response['advertisers']['@attributes']['total-matched'] : 1;
            $pageCount = (int)ceil($all / $perPage);
            if (isset($response['advertisers']['advertiser'])) {
                if ($count == 1) {
                    $this->writeStore($response['advertisers']['advertiser']);
                } else {
                    foreach ($response['advertisers']['advertiser'] as $store) {
                        $this->writeStore($store);
                    }
                }
            }
            $page++;
        } while ($page <= $pageCount);

        if (!empty($this->affiliateList)) {
            $sql = "UPDATE `cw_stores` cws
            LEFT JOIN cw_cpa_link cpl on cpl.cpa_id=" . $this->cpa->id . " AND cws.`active_cpa`=cpl.id
            SET `is_active` = '0'
            WHERE cpl.affiliate_id NOT in(" . implode(',', $this->affiliateList) . ") AND is_active!=-1";
            Yii::$app->db->createCommand($sql)->execute();
        }
        echo 'Stores '.$this->records."\n";
        echo 'Inserted '.$this->inserted."\n";
        echo 'Inserted Cpa link '.$this->cpaLinkInserted."\n";
    }

    private function writeStore($store)
    {
        //d($store);
        $linkurl = $this->trackingServer . "/links/"  . $this->siteId . "/type/am/sid/{{subid}}/" .
            $store['program-url'];
        $this->records++;
        $affiliate_id = (string) $store['advertiser-id'];
        $this->affiliateList[] = $affiliate_id;

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
//                    if ($db_store && ($db_store->logo == $logo || !$db_store->logo)) {
//                        $test_logo = true;
//                    } else {
//                        $test_logo = false;
//                    }
        } else {
            $db_store = false;
//                    $test_logo = true;
        }

        $is_new = false; //метка если более выский уровень вновь созданный
        preg_match('/\:\/\/(.*?)(\?|$)/', $store['program-url'], $matches);
        $route = Yii::$app->help->str2url((string) str_replace('www.', '', $matches[1]));

        //если лого адмитадовский, то проверяем его наличие и при нобходимости обновляем
//                if ($test_logo) {
//                    //проверяем лого на папки
//                    $path = Yii::$app->getBasePath() . '/../frontend/web/images/logos/';
//                    if (!file_exists($path)) {
//                        mkdir($path, 0777, true);
//                    }
//                    //проверяем лого на наличие
//                    if (!file_exists($path . $logo)) {
//                        $file = file_get_contents($store['image']);
//                        file_put_contents($path . $logo, $file);
//                    }
//                }

        //если магазин не нашли по прямому подключению пробуем найти по косвеным признакам

        //поиск по ссылке на магазин
        if (!$db_store) {
            //Проверяем существования магазина на основании его адреса
            //чистим URL
            $url = str_replace("https://", "%", (string )$store['program-url']);
            $url = str_replace("http://", "%", $url);
            $url = str_replace("www.", "", $url);
            //$url=explode('/',$url);
            //$url=$url[0].'%';
            $url = trim($url, '/') . '%';
            $db_store = Stores::find()->where(['like', 'url', $url, false])->one();
        }

        //поиск по ссылке на роуту
        if (!$db_store) {
            $db_store = Stores::find()->where(['route' => $route])->one();
        }

        $cashback7 = preg_replace('/[^[0-9\.\,\%]/', '', $store['seven-day-epc']);
        $cashback3m = preg_replace('/[^[0-9\.\,\%]/', '',$store['three-month-epc']);
        $cashbackClean = $cashback3m ? $cashback3m : $cashback7;
        //Если магазин так и не нашли то создаем
        if (!$db_store) {
            $db_store = new Stores();
            $db_store->name = (string) $store['advertiser-name'];
//                    if (isset($store['name_aliases'])) {
//                        $db_store->alias = $store['name_aliases'];
//                    };
            $db_store->route = $route;
            $db_store->url = (string) $store['program-url'];
            //        $db_store->logo = $logo;
            $db_store->currency = 'USD';//$store['currency'];
            $db_store->hold_time = 30;//$store['max_hold_time'] ? (int)$store['max_hold_time'] : 30;
            $db_store->percent = 50;
            $db_store->displayed_cashback = $cashbackClean;
            if (!$db_store->save()) {
                d($db_store->errors);
            } else {
                $this->inserted++;
            }
        }
        //    elseif ($test_logo && !empty($logo)) {
        //        //если нашли, но лого нужно обновить, то обновляем
        //        $db_store->logo = $logo;
        //    }

        $store_id = $db_store->uid;

        //если нет в базе CPA ЛИНК то создаем ее
        if (!$cpa_id) {
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

        $db_store->displayed_cashback = $cashbackClean;

        $db_store->url = (string)  $store['program-url'];

        if ($db_store->is_active != -1) {
            $db_store->is_active = 1;
        }
        $db_store->save();

    }

}