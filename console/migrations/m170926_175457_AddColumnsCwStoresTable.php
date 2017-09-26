<?php

use yii\db\Migration;

class m170926_175457_AddColumnsCwStoresTable extends Migration
{
    public function safeUp()
    {
        $this->addColumn('cw_stores', 'related', $this->integer());
        $this->addColumn('cw_stores', 'is_offline', $this->smallInteger() . ' DEFAULT 0');
    }

    public function safeDown()
    {
        $this->dropColumn('cw_stores', 'is_offline');
        $this->dropColumn('cw_stores', 'related');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m170926_175457_AddColumnsCwStoresTable cannot be reverted.\n";

        return false;
    }
    */
}
