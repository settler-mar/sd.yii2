<?php

use yii\db\Migration;

/**
 * Class m181109_084750_update_catalog
 */
class m181109_084750_update_catalog extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
      $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
      $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

      $this->addColumn('cw_catalog_stores', 'date_download', $this->timestamp());
      $this->dropColumn('cw_catalog_stores', 'date_update');
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
      echo "m181109_084750_update_catalog cannot be reverted.\n";

      $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
      $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

      $this->dropColumn('cw_catalog_stores', 'date_download');
      $this->addColumn('cw_catalog_stores', 'date_update', $this->timestamp());

    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181109_084750_update_catalog cannot be reverted.\n";

        return false;
    }
    */
}
