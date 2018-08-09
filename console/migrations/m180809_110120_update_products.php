<?php

use yii\db\Migration;

/**
 * Class m180809_110120_update_products
 */
class m180809_110120_update_products extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
      $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
      $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

      $this->addColumn('cw_products', 'visit', $this->integer());
      $this->addColumn('cw_products', 'reward', $this->float());

      $this->execute('TRUNCATE cw_products;');
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        echo "m180809_110120_update_products cannot be reverted.\n";

        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180809_110120_update_products cannot be reverted.\n";

        return false;
    }
    */
}
