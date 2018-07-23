<?php

use yii\db\Migration;

/**
 * Class m180720_120311_add_parram_to_payment
 */
class m180720_120311_add_parram_to_payment extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
      $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
      $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

      $this->addColumn('cw_payments', 'ip', $this->string()->null());
      $this->addColumn('cw_payments', 'sub_id', $this->integer()->null()->defaultValue(0));
      $this->addColumn('cw_cpa', 'sub_id_template', $this->string()->null()->defaultValue("\{\{subid\}\}_\{\{sub_id2\}\}"));
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
      $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
      $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

      $this->dropColumn('cw_payments', 'ip');
      $this->dropColumn('cw_payments', 'sub_id');
      $this->dropColumn('cw_cpa', 'sub_id_template');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180720_120311_add_parram_to_payment cannot be reverted.\n";

        return false;
    }
    */
}
