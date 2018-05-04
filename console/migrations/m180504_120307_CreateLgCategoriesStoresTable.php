<?php

use yii\db\Migration;

/**
 * Class m180504_120307_CreateLgCategoriesStoresTable
 */
class m180504_120307_CreateLgCategoriesStoresTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->createTable('lg_categories_stores', [
            'uid' => $this->primaryKey(),
            'category_id' => $this->integer()->notNull(),
            'language' => $this->string(10)->notNull(),
            'name' => $this->string()->notNull(),
            'short_description' => $this->text(),
            'down_description' => $this->text(),
            'short_description_offline' => $this->text(),
            'down_description_offline' => $this->text(),
        ]);
        $this->createIndex(
            'idx_lg_categories_stores_category_id_language',
            'lg_categories_stores',
            ['category_id', 'language'],
            true
        );
        $this->addForeignKey(
            'fk_lg_categories_stores',
            'lg_categories_stores',
            'category_id',
            'cw_categories_stores',
            'uid'
        );
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropTable('lg_categories_stores');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180504_120307_CreateLgCategoriesStoresTable cannot be reverted.\n";

        return false;
    }
    */
}
