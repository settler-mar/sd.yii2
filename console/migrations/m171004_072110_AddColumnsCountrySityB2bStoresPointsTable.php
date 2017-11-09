<?php

use yii\db\Migration;

class m171004_072110_AddColumnsCountrySityB2bStoresPointsTable extends Migration
{
    public function safeUp()
    {
        $this->addColumn('b2b_stores_points', 'country', $this->string());
        $this->addColumn('b2b_stores_points', 'city', $this->string());
    }

    public function safeDown()
    {
        $this->dropColumn('b2b_stores_points', 'country');
        $this->dropColumn('b2b_stores_points', 'city');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m171004_072110_AddColumnsCountrySityB2bStoresPointsTable cannot be reverted.\n";

        return false;
    }
    */
}
