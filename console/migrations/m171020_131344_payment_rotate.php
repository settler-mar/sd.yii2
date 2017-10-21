<?php

use yii\db\Migration;

class m171020_131344_payment_rotate extends Migration
{
    public function safeUp()
    {
      $this->addColumn('cw_payments', 'rate_id', $this->integer() . ' NULL DEFAULT 0');
      $this->addColumn('cw_payments', 'recalc_json', $this->string() . ' NULL');
    }

    public function safeDown()
    {
        echo "m171020_131344_payment_rotate cannot be reverted.\n";
      $this->dropColumn('cw_payments', 'rate_id');
      $this->dropColumn('cw_payments', 'recalc_json');
        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m171020_131344_payment_rotate cannot be reverted.\n";

        return false;
    }
    */
}
