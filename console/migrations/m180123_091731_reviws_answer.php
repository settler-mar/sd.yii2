<?php

use yii\db\Migration;

/**
 * Class m180123_091731_reviws_answer
 */
class m180123_091731_reviws_answer extends Migration
{
    /**
     * @inheritdoc
     */
    public function safeUp()
    {
      $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
      $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');
      $this->addColumn('cw_users_reviews', 'answer', $this->text()->defaultValue(''));
    }

    /**
     * @inheritdoc
     */
    public function safeDown()
    {
        echo "m180123_091731_reviws_answer cannot be reverted.\n";
      $this->dropColumn('cw_users_reviews', 'answer');
        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180123_091731_reviws_answer cannot be reverted.\n";

        return false;
    }
    */
}
