<?php

use yii\db\Migration;

class m171026_134634_AddColumnStoresTable extends Migration
{
    public function safeUp()
    {
        $this->addColumn('cw_stores', 'related_stores', $this->string());
    }

    public function safeDown()
    {
        $this->dropColumn('cw_stores', 'related_stores');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m171026_134634_AddColumnStoresTable cannot be reverted.\n";

        return false;
    }
    */
}
