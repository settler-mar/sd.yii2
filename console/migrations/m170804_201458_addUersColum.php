<?php

use yii\db\Migration;

class m170804_201458_addUersColum extends Migration
{
    public function up()
    {

      $this->addColumn('cw_users', 'auth_key', $this->string(32)->notNull());
      $this->addColumn('cw_users', 'password_hash', $this->string()->notNull());
      $this->addColumn('cw_users', 'password_reset_token', $this->string()->unique());

    }

    public function down()
    {
      echo "m170804_201458_addUersColum cannot be reverted.\n";
      $this->dropColumn('cw_users', 'auth_key');
      $this->dropColumn('cw_users', 'password_hash');
      $this->dropColumn('cw_users', 'password_reset_token');
      return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m170804_201458_addUersColum cannot be reverted.\n";

        return false;
    }
    */
}
