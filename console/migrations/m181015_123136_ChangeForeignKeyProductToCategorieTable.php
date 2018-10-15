<?php

use yii\db\Migration;

/**
 * Class m181015_123136_ChangeForeignKeyProductToCategorieTable
 */
class m181015_123136_ChangeForeignKeyProductToCategorieTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropForeignKey(
            'fk_products_to_category_product_id',
            'cw_products_to_category'
        );

        $this->addForeignKey(
            'fk_products_to_category_product_id',
            'cw_products_to_category',
            'product_id',
            'cw_product',
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
            'fk_products_to_category_product_id',
            'cw_products_to_category'
        );

        $this->addForeignKey(
            'fk_products_to_category_product_id',
            'cw_products_to_category',
            'product_id',
            'cw_product',
            'id',
            'cascade'
        );
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181015_123136_ChangeForeignKeyProductToCategorieTable cannot be reverted.\n";

        return false;
    }
    */
}
