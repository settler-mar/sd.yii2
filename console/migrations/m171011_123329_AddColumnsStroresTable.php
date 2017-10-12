<?php

use yii\db\Migration;

class m171011_123329_AddColumnsStroresTable extends Migration
{
    public function safeUp()
    {
        $this->addColumn('cw_stores', 'rating', $this->decimal(10, 2));
        $this->addColumn('cw_stores', 'cash_number', $this->smallInteger());
    }

    public function safeDown()
    {
        $this->dropColumn('cw_stores', 'rating');
        $this->dropColumn('cw_stores', 'cash_number');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m171011_123329_AddColumnsStroresTable cannot be reverted.\n";

        return false;
    }
    */
}
