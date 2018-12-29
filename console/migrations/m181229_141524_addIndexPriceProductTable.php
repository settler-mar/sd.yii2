<?php

use yii\db\Migration;

/**
 * Class m181229_141524_addIndexPriceProductTable
 */
class m181229_141524_addIndexPriceProductTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->createIndex('idx_product_price_store_vendor', 'cw_product', ['price','store_id', 'vendor_id']);
        $this->createIndex('idx_product_available', 'cw_product', ['available']);
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropIndex('idx_product_price_store_vendor', 'cw_product');
        $this->dropIndex('idx_product_available', 'cw_product');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181229_141524_addIndexPriceProductTable cannot be reverted.\n";

        return false;
    }
    */
}
