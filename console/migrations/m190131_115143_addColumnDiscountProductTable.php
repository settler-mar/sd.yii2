<?php

use yii\db\Migration;

/**
 * Class m190131_115143_addColumnDiscountProductTable
 */
class m190131_115143_addColumnDiscountProductTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->addColumn('cw_product', 'discount', $this->decimal(7, 4));

        $sql = 'UPDATE `cw_product` SET `discount` = if (old_price, (100 *(old_price - price))/old_price, 0) ';
        $this->execute($sql);
        $this->createIndex('idx_product_discount', 'cw_product', ['discount']);

    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropIndex('idx_product_discount', 'cw_product');

        $this->dropColumn('cw_product', 'discount');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m190131_115143_addColumnDiscountProductTable cannot be reverted.\n";

        return false;
    }
    */
}
