<?php

use yii\db\Migration;

/**
 * Class m181108_070742_AddUserIpColumnWithdrawTable
 */
class m181108_070742_AddUserIpColumnWithdrawTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->addColumn('cw_users_withdraw', 'ip', $this->string());
        $this->addColumn('cw_users_withdraw', 'user_agent', $this->text());
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropColumn('cw_users_withdraw', 'ip');
        $this->dropColumn('cw_users_withdraw', 'user_agent');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181108_070742_AddUserIpColumnWithdrawTable cannot be reverted.\n";

        return false;
    }
    */
}
