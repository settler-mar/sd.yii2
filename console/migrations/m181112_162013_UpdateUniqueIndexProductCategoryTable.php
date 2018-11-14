<?php

use yii\db\Migration;

/**
 * Class m181112_162013_UpdateUniqueIndexProductCategoryTable
 */
class m181112_162013_UpdateUniqueIndexProductCategoryTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropIndex(
            'unique_cw_product_parameters_code',
            'cw_product_parameters'
        );
        $this->dropColumn('cw_product_parameters', 'categories');
        $this->addColumn('cw_product_parameters', 'category_id', $this->integer());
        $this->addForeignKey(
            'fk_product_parameters_category',
            'cw_product_parameters',
            'category_id',
            'cw_products_category',
            'id',
            'cascade'
        );
        $this->createIndex(
            'unique_product_parameters_code_category',
            'cw_product_parameters',
            ['code', 'category_id'],
            true
        );
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropIndex('unique_product_parameters_code_category', 'cw_product_parameters');
        $this->dropForeignKey('fk_product_parameters_category', 'cw_product_parameters');
        $this->dropColumn('cw_product_parameters', 'category_id');
        $this->addColumn('cw_product_parameters', 'categories', $this->json());
        $this->createIndex(
            'unique_cw_product_parameters_code',
            'cw_product_parameters',
            'code',
            true
        );
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181112_162013_UpdateUniqueIndexProductCategoryTable cannot be reverted.\n";

        return false;
    }
    */
}
