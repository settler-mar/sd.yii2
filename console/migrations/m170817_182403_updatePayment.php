<?php

use yii\db\Migration;

class m170817_182403_updatePayment extends Migration
{
    public function safeUp()
    {
      $this->addColumn('cw_payments', 'kurs', $this->float()->null());
    }

    public function safeDown()
    {
      echo "m170817_182403_updateStore cannot be reverted.\n";
      $this->dropColumn('cw_payments', 'kurs');
      return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m170817_182403_updateStore cannot be reverted.\n";

        return false;
    }
    */
}
