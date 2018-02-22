<?php

use yii\db\Migration;

/**
 * Class m180222_184718_fix_user_status
 */
class m180222_184718_fix_user_status extends Migration
{
    /**
     * @inheritdoc
     */
    public function safeUp()
    {

      $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
      $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');
      $this->execute('UPDATE `cw_users` SET `loyalty_status` = 4 WHERE `uid` > 70152;');
    }

    /**
     * @inheritdoc
     */
    public function safeDown()
    {
        echo "m180222_184718_fix_user_status cannot be reverted.\n";

        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180222_184718_fix_user_status cannot be reverted.\n";

        return false;
    }
    */
}
