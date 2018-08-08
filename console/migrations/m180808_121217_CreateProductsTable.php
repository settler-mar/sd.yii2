<?php

use yii\db\Migration;

/**
 * Class m180808_121217_CreateProductsTable
 */
class m180808_121217_CreateProductsTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->createTable('cw_products', [
            'uid' => $this->primaryKey(),
            'store_id' => $this->integer()->notNull(),
            'product_id' => $this->string()->notNull(),
            'title' => $this->string()->notNull(),
            'description' => $this->text(),
            'image' => $this->string(),
            'url' => $this->string(),
            'last_buy' => $this->timestamp()->null(),
            'buy_count' => $this->integer(),
            'last_price' => $this->decimal(10, 2),
            'currency' => $this->string(),
            'created_at' => $this->timestamp() . ' default NOW()',
        ]);

    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropTable('cw_products');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180808_121217_CreateProductsTable cannot be reverted.\n";

        return false;
    }
    */
}
