<?php

use yii\db\Migration;

/**
 * Class m180709_083450_AddPageDisableForDisabledsColumnActionsTable
 */
class m180709_083450_AddPageDisableForDisabledsColumnActionsTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->addColumn('cw_actions', 'page_disabled_for_disableds', $this->boolean());
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropColumn('cw_actions', 'page_disabled_for_disableds');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180709_083450_AddPageDisableForDisabledsColumnActionsTable cannot be reverted.\n";

        return false;
    }
    */
}
