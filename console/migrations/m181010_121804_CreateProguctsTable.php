<?php

use yii\db\Migration;

/**
 * Class m181010_121804_CreateProguctsTable
 */
class m181010_121804_CreateProguctsTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->createTable('cw_product', [
            'id' => $this->primaryKey(),
            'article' => $this->string()->notNull(),
            'available' => $this->smallInteger(),
            'currency' => $this->string(3),
            'description' => $this->text(),
            'store' => $this->integer()->unsigned(),
            'modified_time' => $this->timestamp(),
            'name' => $this->string()->notNull(),
            'old_price' => $this->decimal(10,2),
            'price' => $this->decimal(10,2),
            'params'=> $this->json(),
            'image' => $this->string(),
            'url' => $this->string(),
            'vendor' => $this->string()
        ]);
        $this->createIndex('unique_product_article', 'cw_product', 'article', true);
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropTable('cw_product');
    }
    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181010_121804_CreateProguctsTable cannot be reverted.\n";

        return false;
    }
    */
}
