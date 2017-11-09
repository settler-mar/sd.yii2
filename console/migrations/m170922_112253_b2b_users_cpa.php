<?php

use yii\db\Migration;

class m170922_112253_b2b_users_cpa extends Migration
{
    public function safeUp()
    {
      $this->createTable('b2b_users_cpa', [
        'id' => $this->primaryKey(),
        'cpa_link_id' => $this->integer()->notNull(),
        'user_id' => $this->integer()->notNull(),
        'created_at' => $this->integer()->notNull(),
      ]);
    }

    public function safeDown()
    {
        echo "m170922_112253_b2b_users_cpa cannot be reverted.\n";
        $this->dropTable('b2b_users_cpa');
        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m170922_112253_b2b_users_cpa cannot be reverted.\n";

        return false;
    }
    */
}
