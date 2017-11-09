<?php

use yii\db\Migration;

class m171003_132236_DropColumnB2bStoresPointsTable extends Migration
{
    public function safeUp()
    {
        $this->dropColumn('b2b_stores_points', 'work_time');
    }

    public function safeDown()
    {
        $this->addColumn('b2b_stores_points', 'work_time', $this->string());
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m171003_132236_DropColumnB2bStoresPointsTable cannot be reverted.\n";

        return false;
    }
    */
}
