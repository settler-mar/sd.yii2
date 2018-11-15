<?php

use yii\db\Migration;

/**
 * Class m181115_115311_UpdateUnuqueIndexProductCategoryTable
 */
class m181115_115311_UpdateUnuqueIndexProductCategoryTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropIndex('unique_cw_products_category_route', 'cw_products_category');
        $this->createIndex(
            'unique_cw_products_category_route_parent',
            'cw_products_category',
            ['route', 'parent'],
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

        $this->dropIndex('unique_cw_products_category_route_parent', 'cw_products_category');
        $this->createIndex('unique_cw_products_category_route', 'cw_products_category', 'route', true);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181115_115311_UpdateUnuqueIndexProductCategoryTable cannot be reverted.\n";

        return false;
    }
    */
}
