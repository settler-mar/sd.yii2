<?php

use yii\db\Migration;

/**
 * Class m181012_072553_AddLogitAttempsTable
 */
class m181012_072553_AddLogitAttempsTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->createTable('cw_user_login_attemps', [
            'id' => $this->primaryKey(),
            'ip' => $this->string()->notNull(),
            'count' => $this->integer()->notNull(),
            'last_date' => $this->timestamp()->notNull(),
        ]);
        $this->createIndex('unigue_user_login_attemps_ip', 'cw_user_login_attemps', 'ip', true);
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropTable('cw_user_login_attemps');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181012_072553_AddLogitAttempsTable cannot be reverted.\n";

        return false;
    }
    */
}
