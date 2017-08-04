<?php

use yii\db\Migration;

class m170804_195706_AddColumnsUsersTable extends Migration
{
    public function safeUp()
    {
        $this->addColumn('cw_users', 'action_id', $this->smallInteger(). ' DEFAULT 0');
        $this->addColumn('cw_users', 'contact_name', $this->string());
        $this->addColumn('cw_users', 'contact_phone', $this->string());
        $this->addColumn('cw_users', 'contact_email', $this->string());
    }

    public function safeDown()
    {
        $this->dropColumn('cw_users', 'action_id');
        $this->dropColumn('cw_users', 'contact_name');
        $this->dropColumn('cw_users', 'contact_phone');
        $this->dropColumn('cw_users', 'contact_email');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m170804_195706_AddColumnsUsersTable cannot be reverted.\n";

        return false;
    }
    */
}
