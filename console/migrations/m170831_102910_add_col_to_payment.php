<?php

use yii\db\Migration;

class m170831_102910_add_col_to_payment extends Migration
{
    public function safeUp()
    {
      $this->addColumn('cw_payments', 'admin_comment', $this->string()->null()->defaultValue(''));
      $this->addColumn('cw_payments', 'old_reward', $this->float()->null()->defaultValue(0));
      $this->addColumn('cw_users', 'cnt_declined', $this->integer()->null()->defaultValue(0));
      $this->addColumn('cw_users', 'sum_declined', $this->float()->null()->defaultValue(0));
    }

    public function safeDown()
    {
        echo "m170831_102910_add_col_to_payment cannot be reverted.\n";

        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m170831_102910_add_col_to_payment cannot be reverted.\n";

        return false;
    }
    */
}
