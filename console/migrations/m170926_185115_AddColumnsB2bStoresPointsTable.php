<?php

use yii\db\Migration;

class m170926_185115_AddColumnsB2bStoresPointsTable extends Migration
{
    public function safeUp()
    {
        $this->addColumn('b2b_stores_points', 'work_time', $this->string());
    }

    public function safeDown()
    {
        $this->dropColumn('b2b_stores_points', 'work_time');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m170926_185115_AddColumnsB2bStoresPointsTable cannot be reverted.\n";

        return false;
    }
    */
}
