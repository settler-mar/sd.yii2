<?php

use yii\db\Migration;

/**
 * Class m181010_123441_CreateForeignKeysProguctsCategoryTable
 */
class m181010_123441_CreateForeignKeysProguctsCategoryTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->addForeignKey(
            'fk_products_to_category_product_id',
            'cw_products_to_category',
            'product_id',
            'cw_product',
            'id'
        );
        $this->addForeignKey(
            'fk_products_to_category_category_id',
            'cw_products_to_category',
            'category_id',
            'cw_products_category',
            'id'
        );
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropForeignKey('fk_products_to_category_product_id', 'cw_products_to_category');
        $this->dropForeignKey('fk_products_to_category_category_id', 'cw_products_to_category');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181010_123441_CreateForeignKeysProguctsCategoryTable cannot be reverted.\n";

        return false;
    }
    */
}
