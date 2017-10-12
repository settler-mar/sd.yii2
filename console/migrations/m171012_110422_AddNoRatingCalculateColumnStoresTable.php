<?php

use yii\db\Migration;

class m171012_110422_AddNoRatingCalculateColumnStoresTable extends Migration
{
    public function safeUp()
    {
        $this->addColumn('cw_stores', 'no_rating_calculate', $this->smallInteger());
    }

    public function safeDown()
    {
        $this->dropColumn('cw_stores', 'no_rating_calculate');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m171012_110422_AddNoRatingCalculateColumnStoresTable cannot be reverted.\n";

        return false;
    }
    */
}
