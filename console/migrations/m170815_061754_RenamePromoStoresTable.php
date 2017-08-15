<?php

use yii\db\Migration;

class m170815_061754_RenamePromoStoresTable extends Migration
{
//    public function safeUp()
//    {
//
//    }
//
//    public function safeDown()
//    {
//        echo "m170815_061754_RenamePromoStoresTable cannot be reverted.\n";
//
//        return false;
//    }


    // Use up()/down() to run migration code without a transaction.
    public function up()
    {
        $this->renameTable('cw_promo_stores', 'cw_slider');
    }

    public function down()
    {
        $this->renameTable('cw_slider', 'cw_promo_stores');
//        echo "m170815_061754_RenamePromoStoresTable cannot be reverted.\n";
//
//        return false;
    }

}
