<?php

use yii\db\Migration;

/**
 * Class m180622_130634_AddActionsActionsTable
 */
class m180622_130634_AddActionsActionsTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->createTable('cw_actions_actions', [
            'uid' => $this->primaryKey(),

            'action_id' => $this->integer()->notNull(),

            'payment_count' => $this->integer(),
            'payment_stores_list' => $this->text(),

            'referral_count' => $this->integer(),

            'users_payment_count' => $this->integer(),
            'new_users_payment_count' => $this->integer(),

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

        $this->dropTable('cw_actions_actions');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180622_130634_AddActionsActionsTable cannot be reverted.\n";

        return false;
    }
    */
}
