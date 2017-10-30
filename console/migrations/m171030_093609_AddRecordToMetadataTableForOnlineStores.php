<?php

use yii\db\Migration;
use frontend\modules\meta\models\Meta;


class m171030_093609_AddRecordToMetadataTableForOnlineStores extends Migration
{
    public function safeUp()
    {
        $metaStores = Meta::find()->where(['page' => 'stores/*'])->one();
        $metaOnline = new Meta();
        if ($metaStores) {
            $metaOnline->attributes = $metaStores->attributes;
            $metaOnline->uid = null;
        }
        $metaOnline->page = 'stores/*/online';
        $metaOnline->save();
        $metaCoupons = Meta::find()->where(['page' => 'coupons/store/*'])->one();
        $metaOnline = new Meta();
        if ($metaCoupons) {
            $metaOnline->attributes = $metaCoupons->attributes;
            $metaOnline->uid = null;
        }
        $metaOnline->page = 'coupons/store/*/online';
        $metaOnline->save();
        $metaCouponsExpired = Meta::find()->where(['page' => 'coupons/store/*/expired'])->one();
        $metaOnline = new Meta();
        if ($metaCouponsExpired) {
            $metaOnline->attributes = $metaCouponsExpired->attributes;
            $metaOnline->uid = null;
        }
        $metaOnline->page = 'coupons/store/*/online/expired';
        $metaOnline->save();

    }

    public function safeDown()
    {
        Meta::deleteAll([
            'or',
            'page = "stores/*/online"',
            'page = "coupons/store/*/online"',
            'page = "coupons/store/*/online/expired"',
        ]);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m171030_093609_AddRecordToMetadataTableForOnlineStores cannot be reverted.\n";

        return false;
    }
    */
}
