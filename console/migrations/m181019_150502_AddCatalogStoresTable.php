<?php

use yii\db\Migration;

/**
 * Class m181019_150502_AddCatalogStoresTable
 */
class m181019_150502_AddCatalogStoresTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->createTable('cw_catalog_stores', [
            'id' => $this->primaryKey(),
            'cpa_id' => $this->integer()->notNull(),
            'affiliate_id' =>$this->integer()->notNull(),
            'active' => $this->smallInteger(),
            'date_import' => $this->timestamp(),
            'date_update' => $this->timestamp(),
            'crated_at' => $this->timestamp() . ' default NOW()',
        ]);

        $this->createIndex(
            'unuque_catalog_stores_cpa_affiliate',
            'cw_catalog_stores',
            ['cpa_id', 'affiliate_id'],
            true
        );

        $this->addForeignKey(
            'fk_catalog_stores_cpa_id',
            'cw_catalog_stores',
            'cpa_id',
            'cw_cpa',
            'id'
        );

        //меняем индекс для продуктов
        $this->dropIndex('unique_product_article_cpa_id', 'cw_product');
        $this->createIndex('unique_product_cpa_id_store_article', 'cw_product', ['cpa_id', 'store', 'article'], true);

    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropForeignKey('fk_catalog_stores_cpa_id', 'cw_catalog_stores');

        $this->dropTable('cw_catalog_stores');

        $this->dropForeignKey('fk_product_cpa_id', 'cw_product');

        $this->dropIndex('unique_product_cpa_id_store_article', 'cw_product');
        $this->createIndex('unique_product_article_cpa_id', 'cw_product', ['article', 'cpa_id'], true);

        $this->addForeignKey(
            'fk_product_cpa_id',
            'cw_product',
            'cpa_id',
            'cw_cpa',
            'id'
        );
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181019_150502_AddCatalogStoresTable cannot be reverted.\n";

        return false;
    }
    */
}
