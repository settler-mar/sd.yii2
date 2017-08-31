<?php

use yii\db\Migration;

class m170831_160554_add_col_to_payment extends Migration
{
    public function safeUp()
    {
      $this->addColumn('cw_payments', 'old_order_price', $this->float()->null()->defaultValue(0));
    }

    public function safeDown()
    {
        echo "m170831_160554_add_col_to_payment cannot be reverted.\n";

        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m170831_160554_add_col_to_payment cannot be reverted.\n";

        return false;
    }
    */
}
