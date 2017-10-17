<?php

use yii\db\Migration;

class m171017_125507_addColumnStorePointIdPaymentsTable extends Migration
{
    public function safeUp()
    {
        $this->addColumn('cw_payments', ' store_point_id', $this->integer() . ' DEFAULT 0');
    }

    public function safeDown()
    {
        $this->dropColumn('cw_payments', ' store_point_id');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m171017_125507_addColumnStorePointIdPaymentsTable cannot be reverted.\n";

        return false;
    }
    */
}
