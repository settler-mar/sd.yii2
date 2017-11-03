<?php

use yii\db\Migration;

class m171102_112436_AddColumnEmailVerifiedUsersTable extends Migration
{
    public function safeUp()
    {
        $this->addColumn('cw_users', 'email_verified', $this->boolean() . ' DEFAULT 0');
        $this->addColumn('cw_users', 'email_verify_token', $this->string());
    }

    public function safeDown()
    {
        $this->dropColumn('cw_users', 'email_verified');
        $this->dropColumn('cw_users', 'email_verify_token');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m171102_112436_AddColumnEmailVerifiedUsersTable cannot be reverted.\n";

        return false;
    }
    */
}
