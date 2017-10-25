<?php

use yii\db\Migration;

class m171025_082336_add_col_to_b2b_user extends Migration
{
    public function safeUp()
    {
      $this->addColumn('b2b_users', 'is_active', $this->integer(1)->null()->defaultValue(0));
      $this->addColumn('b2b_users', 'fio', $this->string()->null()->defaultValue(''));
      $this->addColumn('b2b_users', 'position', $this->string()->null()->defaultValue(''));
      $this->addColumn('b2b_users', 'phone', $this->string()->null()->defaultValue(''));
      $this->addColumn('b2b_users', 'anketa', $this->text()->null());
      $this->dropColumn('b2b_users', 'first_name');
      $this->dropColumn('b2b_users', 'last_name');
    }

    public function safeDown()
    {
      echo "m171025_082336_add_col_to_b2b_user cannot be reverted.\n";
      $this->dropColumn('b2b_users', 'is_active');
      $this->dropColumn('b2b_users', 'fio');
      $this->dropColumn('b2b_users', 'position');
      $this->dropColumn('b2b_users', 'phone');
      $this->dropColumn('b2b_users', 'anketa');
      $this->addColumn('b2b_users', 'first_name', $this->string()->notNull()->defaultValue(''));
      $this->addColumn('b2b_users', 'last_name', $this->string()->notNull()->defaultValue(''));
      return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m171025_082336_add_col_to_b2b_user cannot be reverted.\n";

        return false;
    }
    */
}
