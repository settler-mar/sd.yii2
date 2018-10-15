<?php

use yii\db\Migration;

/**
 * Class m181015_120447_AddColumnsProductTable
 */
class m181015_120447_AddColumnsProductTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->addColumn('cw_product', 'cpa_id', $this->integer()->notNull()->defaultValue(1));
        $this->addColumn('cw_product', 'params_original', $this->text());
        $this->addColumn('cw_product', 'data_hash', $this->string());

        $this->dropIndex('unique_product_article', 'cw_product');
        $this->createIndex('unique_product_article_cpa_id', 'cw_product', ['article', 'cpa_id'], true);

        $this->addForeignKey(
            'fk_product_cpa_id',
            'cw_product',
            'cpa_id',
            'cw_cpa',
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

        $this->dropForeignKey(
            'fk_product_cpa_id',
            'cw_product'
        );

        $this->dropIndex('unique_product_article_cpa_id', 'cw_product');

        $this->dropColumn('cw_product', 'cpa_id');
        $this->dropColumn('cw_product', 'params_original');
        $this->dropColumn('cw_product', 'data_hash');

        $this->createIndex('unique_product_article', 'cw_product', 'article', true);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181015_120447_AddColumnsProductTable cannot be reverted.\n";

        return false;
    }
    */
}
