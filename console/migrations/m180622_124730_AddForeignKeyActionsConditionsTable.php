<?php

use yii\db\Migration;

/**
 * Class m180622_124730_AddForeignKeyActionsConditionsTable
 */
class m180622_124730_AddForeignKeyActionsConditionsTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->addForeignKey(
            'fk_actions_conditions_action_id',
            'cw_actions_conditions',
            'action_id',
            'cw_actions',
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

        $this->dropForeignKey(
            'fk_actions_conditions_action_id',
            'cw_actions_conditions'
        );
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180622_124730_AddForeignKeyActionsConditionsTable cannot be reverted.\n";

        return false;
    }
    */
}
