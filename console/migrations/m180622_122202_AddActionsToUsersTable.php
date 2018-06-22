<?php

use yii\db\Migration;

/**
 * Class m180622_122202_AddActionsToUsersTable
 */
class m180622_122202_AddActionsToUsersTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->createTable('cw_actions_to_users', [
            'uid' => $this->primaryKey(),

            'action_id' => $this->integer()->notNull(),
            'user_id' => $this->integer()->notNull(),

            'date_start' => $this->timestamp()->defaultValue(null),
            'date_end' => $this->timestamp()->defaultValue(null),
            'complete' => $this->boolean(),

            'created_at' => $this->timestamp(). ' default NOW()'
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropTable('cw_actions_to_users');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180622_122202_AddActionsToUsersTable cannot be reverted.\n";

        return false;
    }
    */
}
