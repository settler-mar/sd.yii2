<?php

use yii\db\Migration;

class m171014_054550_addColumnLoginB2bStoresPointsTable extends Migration
{
    public function safeUp()
    {
        $this->addColumn('b2b_stores_points', 'login', $this->string());
        $this->createIndex('idx_b2b_stores_points_login', 'b2b_stores_points', 'login', true);
    }

    public function safeDown()
    {
        $this->dropColumn('b2b_stores_points', 'login');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m171014_054550_addColumnLoginB2bStoresPointsTable cannot be reverted.\n";

        return false;
    }
    */
}
