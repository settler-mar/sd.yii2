<?php

use yii\db\Migration;

/**
 * Class m181102_084655_AddCatalogIdColumnProductTable
 */
class m181102_084655_AddCatalogIdColumnProductTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->addColumn('cw_product','catalog_id', $this->integer());

        $this->dropIndex('unique_product_cpa_id_store_article', 'cw_product');
        $this->renameColumn('cw_product', 'store', 'store_id');
        $this->createIndex('unique_product_cpa_id_store_id_article', 'cw_product', ['cpa_id', 'store_id', 'article'], true);

        $this->addForeignKey('fk_product_catalog_id', 'cw_product', 'catalog_id', 'cw_catalog_stores', 'id');

        $this->alterColumn('cw_product', 'store_id', $this->integer());
        $this->addForeignKey('fk_product_store_id', 'cw_product', 'store_id', 'cw_stores', 'uid');

    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropForeignKey('fk_product_catalog_id', 'cw_product');
        $this->dropForeignKey('fk_product_store_id', 'cw_product');

        $this->dropColumn('cw_product','catalog_id');

        $this->dropIndex('unique_product_cpa_id_store_id_article', 'cw_product');
        $this->renameColumn('cw_product', 'store_id', 'store');
        $this->createIndex('unique_product_cpa_id_store_article', 'cw_product', ['cpa_id', 'store', 'article'], true);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181102_084655_AddCatalogIdColumnProductTable cannot be reverted.\n";

        return false;
    }
    */
}
