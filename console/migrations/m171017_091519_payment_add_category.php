<?php

use yii\db\Migration;

class m171017_091519_payment_add_category extends Migration
{
    public function safeUp()
    {
      $this->addColumn('cw_payments', 'action_code', $this->integer()->null());
    }

    public function safeDown()
    {
        echo "m171017_091519_payment_add_category cannot be reverted.\n";
      $this->dropColumn('cw_payments', 'action_code');
        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m171017_091519_payment_add_category cannot be reverted.\n";

        return false;
    }
    */
}
