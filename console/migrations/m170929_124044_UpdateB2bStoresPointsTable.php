<?php

use yii\db\Migration;

class m170929_124044_UpdateB2bStoresPointsTable extends Migration
{
    public function safeUp()
    {
        $this->alterColumn('b2b_stores_points', 'coordinate_x', $this->decimal(9, 6));
        $this->alterColumn('b2b_stores_points', 'coordinate_y', $this->decimal(8, 6));

    }

    public function safeDown()
    {
        $this->alterColumn('b2b_stores_points', 'coordinate_x', $this->float());
        $this->alterColumn('b2b_stores_points', 'coordinate_y', $this->float());
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m170929_124044_UpdateB2bStoresPointsTable cannot be reverted.\n";

        return false;
    }
    */
}
