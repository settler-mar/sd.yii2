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

        $cpa = Cpa::find()->where(['name' => 'Shareasale'])->one();
        if (!$cpa) {
            echo 'Cpa type Shareasale not found';
            return;
        }

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

            //d($merchantDetails);

            foreach ($merchantDetails as $store) {
                $records++;
                $affiliate_id = (string) $store->merchantid;
                $affiliate_list[] = $affiliate_id;

                $cpa_link = CpaLink::findOne(['cpa_id' => $cpa->id, 'affiliate_id' => $affiliate_id]);

                $cpa_id = false;

                if ($cpa_link) {
                    //если CPA link нашли то проверяем ссылку и при необходимости обновляем ее
                    if ($cpa_link->affiliate_link != (string) $store ->linkurl) {
                        $cpa_link->affiliate_link = (string) $store->linkurl;
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
                $route = Yii::$app->help->str2url((string) $store->merchant);

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
                    $url = str_replace("https://", "%", (string) $store->www);
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

                $cashback = $store->salecomm;
                $cashbackClean = preg_replace('/[^[0-9\.\,\%]/', '', $cashback);
                //echo $cashback .' '.$cashbackClean."\n";
                //Если магазин так и не нашли то создаем
                if (!$db_store) {
                    $db_store = new Stores();
                    $db_store->name = (string) $store->merchant;
//                    if (isset($store['name_aliases'])) {
//                        $db_store->alias = $store['name_aliases'];
//                    };
                    $db_store->route = $route;
                    $db_store->url = (string) $store->www;
            //        $db_store->logo = $logo;
                    $db_store->currency = 'USD';//$store['currency'];
                    $db_store->hold_time = 30;//$store['max_hold_time'] ? (int)$store['max_hold_time'] : 30;
                    $db_store->percent = 50;
                    $db_store->displayed_cashback = $cashbackClean;
                    if (!$db_store->save()) {
                        d($db_store->errors);
                    } else {
                        $inserted++;
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
                    $cpa_link->cpa_id = $cpa->id;
                    $cpa_link->stores_id = $store_id;
                    $cpa_link->affiliate_id = $affiliate_id;
                    $cpa_link->affiliate_link = (string) $store->linkurl;
                    if (!$cpa_link->save()) {
                        d($cpa_link->errors);
                        continue;
                    }
                    $cpalinkInserted++;

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

                $db_store->url = (string) $store->www;

                if ($db_store->is_active != -1) {
                    $db_store->is_active = 1;
                }
                $db_store->save();


            }
        }
        if (!empty($affiliate_list)) {
            $sql = "UPDATE `cw_stores` cws
            LEFT JOIN cw_cpa_link cpl on cpl.cpa_id=" . $cpa->id . " AND cws.`active_cpa`=cpl.id
            SET `is_active` = '0'
            WHERE cpl.affiliate_id NOT in(" . implode(',', $affiliate_list) . ") AND is_active!=-1";
            Yii::$app->db->createCommand($sql)->execute();
        }
        echo 'Stores '.$records."\n";
        echo 'Inserted '.$inserted."\n";
        echo 'Inserted Cpa link '.$cpalinkInserted."\n";

    }


}