<?php

use yii\db\Migration;

/**
 * Class m180622_122738_AddForeignKeyActionsToUsersTable
 */
class m180622_122738_AddForeignKeyActionsToUsersTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->addForeignKey(
            'fk_action_to_users_action_id',
            'cw_actions_to_users',
            'action_id',
            'cw_actions',
            'uid'
        );
        $this->addForeignKey(
            'fk_action_to_users_user_id',
            'cw_actions_to_users',
            'user_id',
            'cw_users',
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

        $this->dropForeignKey('fk_action_to_users_action_id', 'cw_actions_to_users');
        $this->dropForeignKey('fk_action_to_users_user_id', 'cw_actions_to_users');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180622_122738_AddForeignKeyActionsToUsersTable cannot be reverted.\n";

        return false;
    }
    */
}
