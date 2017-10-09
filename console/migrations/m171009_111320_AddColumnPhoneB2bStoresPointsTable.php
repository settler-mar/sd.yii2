<?php

use yii\db\Migration;

class m171009_111320_AddColumnPhoneB2bStoresPointsTable extends Migration
{
    public function safeUp()
    {
        $this->addColumn('b2b_stores_points', 'phone', $this->string());
    }

    public function safeDown()
    {
        $this->dropColumn('b2b_stores_points', 'phone');
    }
    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m171009_111320_AddColumnPhoneB2bStoresPointsTable cannot be reverted.\n";

        return false;
    }
    */
}
