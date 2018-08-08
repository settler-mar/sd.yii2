<?php

use yii\db\Migration;

/**
 * Class m180808_122922_CreateIndexesProductsTable
 */
class m180808_122922_CreateIndexesProductsTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->createIndex('unigue_products_store_id_product_id', 'cw_products', ['store_id', 'product_id'], true);
        $this->addForeignKey('fk_products_store_id', 'cw_products', 'store_id', 'cw_stores', 'uid');
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropForeignKey('fk_products_store_id', 'cw_products');
        $this->dropIndex('unigue_products_store_id_product_id', 'cw_products');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180808_122922_CreateIndexesProductsTable cannot be reverted.\n";

        return false;
    }
    */
}
