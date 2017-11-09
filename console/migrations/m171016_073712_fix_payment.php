<?php

use yii\db\Migration;

class m171016_073712_fix_payment extends Migration
{
    public function safeUp()
    {
      $this->alterColumn('cw_payments', 'order_price', $this->float()->null()->defaultValue(0));
    }

    public function safeDown()
    {
        echo "m171016_073712_fix_payment cannot be reverted.\n";
        $this->alterColumn('cw_payments', 'order_price', $this->float()->notNull()->defaultValue(0));
        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m171016_073712_fix_payment cannot be reverted.\n";

        return false;
    }
    */
}
