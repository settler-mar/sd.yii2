<?php

use yii\db\Migration;

/**
 * Class m180129_085737_user_in_action
 */
class m180129_085737_user_in_action extends Migration
{
    /**
     * @inheritdoc
     */
    public function safeUp()
    {
      $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
      $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');
      $this->addColumn('cw_users', 'in_action', $this->dateTime()->null());
    }

    /**
     * @inheritdoc
     */
    public function safeDown()
    {
        echo "m180129_085737_user_in_action cannot be reverted.\n";
      $this->dropColumn('cw_users', 'in_action');
      return false;
        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180129_085737_user_in_action cannot be reverted.\n";

        return false;
    }
    */
}
