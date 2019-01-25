<?php

use yii\db\Migration;

/**
 * Class m190125_100801_AddSortNameFieldProductTable
 */
class m190125_100801_AddSortNameFieldProductTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->addColumn('cw_product', 'namesort', $this->string());
        $this->createIndex('idx_product_namesort', 'cw_product', ['namesort']);
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropIndex('idx_product_namesort', 'cw_product');
        $this->dropColumn('cw_product', 'namesort');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m190125_100801_AddSortNameFieldProductTable cannot be reverted.\n";

        return false;
    }
    */
}
