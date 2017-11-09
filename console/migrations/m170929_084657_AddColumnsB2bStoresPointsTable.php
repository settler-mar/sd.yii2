<?php

use yii\db\Migration;

class m170929_084657_AddColumnsB2bStoresPointsTable extends Migration
{
    public function safeUp()
    {
        $this->addColumn('b2b_stores_points', 'coordinate_x', $this->float());
        $this->addColumn('b2b_stores_points', 'coordinate_y', $this->float());
        $this->addColumn('b2b_stores_points', 'work_time_json', $this->text());
    }

    public function safeDown()
    {
        $this->dropColumn('b2b_stores_points', 'coordinate_x');
        $this->dropColumn('b2b_stores_points', 'coordinate_y');
        $this->dropColumn('b2b_stores_points', 'work_time_json');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m170929_084657_AddColumnsB2bStoresPointsTable cannot be reverted.\n";

        return false;
    }
    */
}
