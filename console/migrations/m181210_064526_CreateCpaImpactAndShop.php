<?php

use yii\db\Migration;
use frontend\modules\stores\models\Cpa;
use frontend\modules\stores\models\CpaLink;
use frontend\modules\stores\models\Stores;


/**
 * Class m181210_064526_CreateCpaImpactAndShop
 */
class m181210_064526_CreateCpaImpactAndShop extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $cpa = new Cpa();
        $cpa->name = 'Impact';
        $cpa->save();

        $store = new Stores();
        $store->name = 'Impact';
        $store->route = 'impact-com';
        $store->url = 'https://impact.com/';
        $store->currency = 'USD';
        $store->settlement_currency = 'USD';
        $store->percent = 50;
        $store->hold_time =  30;
        $store->displayed_cashback = 'до 10%';
        $store->is_active = 1;
        $store->hide_on_site = 1;//не показывать на сайте
        if (!$store->save()) {
            d($store->errors);
        }

        $cpaLink = new CpaLink();
        $cpaLink->cpa_id = $cpa->id;
        $cpaLink->stores_id = $store->uid;
        $cpaLink->affiliate_id = 0;
        $cpaLink->affiliate_link = '-';
        if (!$cpaLink->save()) {
            d($cpaLink->errors);
        }

        $cpaLink->affiliate_id = $cpaLink->id;
        if (!$cpaLink->save()) {
            d($cpaLink->errors);
        }

        $store->active_cpa = $cpaLink->id;
        if (!$store->save()) {
            d($store->errors);
        }

    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        Stores::deleteAll(['route' => 'impact-com']);
        Cpa::deleteAll(['name' => 'Impact']);

    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181210_064526_CreateCpaImpactAndShop cannot be reverted.\n";

        return false;
    }
    */
}
