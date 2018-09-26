<?php

use yii\db\Migration;

/**
 * Class m180925_074904_store_action_in_payment
 */
class m180925_074904_store_action_in_payment extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
      $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
      $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

      $this->addColumn('cw_payments', 'store_action', $this->integer()->defaultValue(0));
      $this->addColumn('cw_stores', 'action_end_date', $this->date()->null()->after('action_id'));
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
      $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
      $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');
      $this->dropColumn('cw_payments', 'store_action');
      $this->dropColumn('cw_stores', 'action_end_date');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180925_074904_store_action_in_payment cannot be reverted.\n";

        return false;
    }
    */
}
