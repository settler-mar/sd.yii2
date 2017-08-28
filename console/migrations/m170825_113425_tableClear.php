<?php

use yii\db\Migration;

class m170825_113425_tableClear extends Migration
{
    public function safeUp()
    {
      $this->dropTable('cw_users_password_recovery');
      $this->dropTable('cw_users_mark');

    }

    public function safeDown()
    {
        echo "m170825_113425_tableClear cannot be reverted.\n";
        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m170825_113425_tableClear cannot be reverted.\n";

        return false;
    }
    */
}
