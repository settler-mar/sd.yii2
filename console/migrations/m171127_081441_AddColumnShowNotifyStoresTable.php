<?php

use yii\db\Migration;

class m171127_081441_AddColumnShowNotifyStoresTable extends Migration
{
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->addColumn('cw_stores', 'show_notify', $this->boolean()->defaultValue(false));
    }

    public function safeDown()
    {
        $this->dropColumn('cw_stores', 'show_notify');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m171127_081441_AddColumnShowNotifyStoresTable cannot be reverted.\n";

        return false;
    }
    */
}
