<?php

use yii\db\Migration;

/**
 * Class m190123_092344_ChangeUniqueIndexProductsCategoryTable
 */
class m190123_092344_ChangeUniqueIndexProductsCategoryTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropIndex('unique_cw_products_category_route_parent', 'cw_products_category');
        $this->createIndex(
            'unique_cw_products_category_code_store_cpa',
            'cw_products_category',
            ['code', 'store_id', 'cpa_id'],
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

        $this->dropIndex('unique_cw_products_category_code_store_cpa', 'cw_products_category');
        $this->createIndex(
            'unique_cw_products_category_route_parent',
            'cw_products_category',
            ['route', 'parent'],
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
        echo "m190123_092344_ChangeUniqueIndexProductsCategoryTable cannot be reverted.\n";

        return false;
    }
    */
}
