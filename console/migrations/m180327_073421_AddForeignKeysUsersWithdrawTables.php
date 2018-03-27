<?php

use yii\db\Migration;

/**
 * Class m180327_073421_AddForeignKeysUsersWithdrawTables
 */
class m180327_073421_AddForeignKeysUsersWithdrawTables extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        \Yii::$app->db->createCommand('DELETE FROM `cw_users_withdraw` WHERE `user_id` not in (select `uid` from `cw_users`)')
            ->execute();

        $this->addForeignKey (
            'fk_users_withdraw_user_id',
            'cw_users_withdraw',
            'user_id',
            'cw_users',
            'uid'
        );
        $this->addForeignKey (
            'fk_users_withdraw_process_id',
            'cw_users_withdraw',
            'process_id',
            'cw_withdraw_process',
            'uid'
        );

    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropForeignKey('fk_users_withdraw_user_id', 'cw_users_withdraw');
        $this->dropForeignKey('fk_users_withdraw_process_id', 'cw_users_withdraw');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180327_073421_AddForeignKeysUsersWithdrawTables cannot be reverted.\n";

        return false;
    }
    */
}
