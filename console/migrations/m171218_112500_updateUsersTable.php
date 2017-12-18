<?php

use yii\db\Migration;

/**
 * Class m171218_112500_updateUsersTable
 */
class m171218_112500_updateUsersTable extends Migration
{
    /**
     * @inheritdoc
     */
    public function safeUp()
    {
      $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
      $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');
      $this->addColumn('cw_users', 'url', $this->string()->null()->defaultValue(''));
      $this->addColumn('cw_users', 'traffType', $this->integer()->null());
      $this->addColumn('cw_users', 'waitModeration', $this->integer()->null()->defaultValue(0));
    }

    /**
     * @inheritdoc
     */
    public function safeDown()
    {
        echo "m171218_112500_updateUsersTable cannot be reverted.\n";
      $this->dropColumn('cw_users', 'url');
      $this->dropColumn('cw_users', 'traffType');
      $this->dropColumn('cw_users', 'waitModeration');
        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m171218_112500_updateUsersTable cannot be reverted.\n";

        return false;
    }
    */
}
