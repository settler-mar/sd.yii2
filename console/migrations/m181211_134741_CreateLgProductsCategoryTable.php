<?php

use yii\db\Migration;

/**
 * Class m181211_134741_CreateLgProductsCategoryTable
 */
class m181211_134741_CreateLgProductsCategoryTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->createTable('lg_products_category', [
            'id' => $this->primaryKey(),
            'category_id' => $this->integer()->notNull(),
            'language' => $this->string(10)->notNull(),
            'name' => $this->string()->notNull(),
        ]);
        $this->createIndex(
            'idx_lg_products_category_id_language',
            'lg_products_category',
            ['category_id', 'language'],
            true
        );
        $this->addForeignKey(
            'fk_lg_products_category',
            'lg_products_category',
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

        $this->dropTable('lg_products_category');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181211_134741_CreateLgProductsCategoryTable cannot be reverted.\n";

        return false;
    }
    */
}
