<?php

use yii\db\Migration;

class m171023_103848_update_json_in_payments extends Migration
{
    public function safeUp()
    {
      $this->alterColumn('cw_payments', 'recalc_json', $this->text()->null());
      }

    public function safeDown()
    {
        echo "m171023_103848_update_json_in_payments cannot be reverted.\n";
      $this->alterColumn('cw_payments', 'recalc_json', $this->string()->null());

      return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m171023_103848_update_json_in_payments cannot be reverted.\n";

        return false;
    }
    */
}
