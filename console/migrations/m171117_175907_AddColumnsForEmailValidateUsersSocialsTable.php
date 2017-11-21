<?php

use yii\db\Migration;

class m171117_175907_AddColumnsForEmailValidateUsersSocialsTable extends Migration
{
    public function safeUp()
    {
      $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
      $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

      $this->addColumn('cw_users_social', 'email_manual', $this->string());
      $this->addColumn('cw_users_social', 'email_verify_token', $this->string());
    }

    public function safeDown()
    {
        $this->dropColumn('cw_users_social', 'email_manual');
        $this->dropColumn('cw_users_social', 'email_verify_token');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m171117_175907_AddColumnsForEmailValidateUsersSocialsTable cannot be reverted.\n";

        return false;
    }
    */
}
