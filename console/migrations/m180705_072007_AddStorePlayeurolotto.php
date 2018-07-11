<?php

use yii\db\Migration;
use frontend\modules\stores\models\Stores;
use frontend\modules\stores\models\CpaLink;
use frontend\modules\stores\models\Cpa;

/**
 * Class m180705_072007_AddStorePlayeurolotto
 */
class m180705_072007_AddStorePlayeurolotto extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $store = new Stores();
        $store->name = 'PlayEuroLotto';
        $store->route = 'playeurolotto-com';
        $store->url = 'https://www.playeurolotto.com';
        $store->currency = 'EUR';
        $store->percent = 50;
        $store->hold_time =  30;
        $store->displayed_cashback = 'до 10%';
        $store->is_active = 1;
        if (!$store->save()) {
            d($store->errors);
        }
        $cpa  = Cpa::findOne(['name' => 'Внешние подключения']);

        $cpaLink = new CpaLink();
        $cpaLink->cpa_id = $cpa->id;
        $cpaLink->stores_id = $store->uid;
        $cpaLink->affiliate_id = 0;
        $cpaLink->affiliate_link = 'https://www.playeurolotto.com/#eppti4ro2ggft91j&_t={{subid}}';
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
        $store = Stores::findOne(['route' => 'playeurolotto-com']);
        $cpaLink = $store->cpaLink;
        if ($cpaLink) {
            $cpaLink->delete();
        }
        if ($store) {
            $store->delete();
        }
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180705_072007_AddStorePlayeurolotto cannot be reverted.\n";

        return false;
    }
    */
}
