<?php

use yii\db\Migration;

class m171117_175907_AddColumnsForEmailValidateUsersSocialsTable extends Migration
{
    public function safeUp()
    {
        $this->addColumn('cw_users_social', 'email_verified', $this->boolean() . ' DEFAULT 0');
        $this->addColumn('cw_users_social', 'email_verify_token', $this->string());
    }

    public function safeDown()
    {
        $this->dropColumn('cw_users_social', 'email_verified');
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
