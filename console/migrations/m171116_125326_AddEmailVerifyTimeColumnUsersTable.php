<?php

use yii\db\Migration;

class m171116_125326_AddEmailVerifyTimeColumnUsersTable extends Migration
{
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');
        $this->execute('SET @@global.sql_mode ="ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION";');
        $this->execute('SET GLOBAL sql_mode=(SELECT REPLACE(@@sql_mode,\'ONLY_FULL_GROUP_BY\',\'\'));');

        $this->addColumn('cw_users', 'email_verify_time', $this->timestamp()->defaultValue(null));
    }

    public function safeDown()
    {
        $this->dropColumn('cw_users', 'email_verify_time');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m171116_125326_AddEmailVerifyTimeColumnUsersTable cannot be reverted.\n";

        return false;
    }
    */
}
