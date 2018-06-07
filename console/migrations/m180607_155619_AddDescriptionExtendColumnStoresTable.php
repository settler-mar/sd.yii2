<?php

use yii\db\Migration;

/**
 * Class m180607_155619_AddDescriptionExtendColumnStoresTable
 */
class m180607_155619_AddDescriptionExtendColumnStoresTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->addColumn('cw_stores', 'description_extend', $this->text());
        $this->addColumn('lg_stores', 'description_extend', $this->text());
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropColumn('cw_stores', 'description_extend');
        $this->dropColumn('lg_stores', 'description_extend');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180607_155619_AddDescriptionExtendColumnStoresTable cannot be reverted.\n";

        return false;
    }
    */
}
