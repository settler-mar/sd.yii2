<?php

use yii\db\Migration;

/**
 * Class m180326_142025_AddForeignKeysStoresToCategoriesTable
 */
class m180326_142025_AddForeignKeysStoresToCategoriesTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        \Yii::$app->db->createCommand('delete from `cw_stores_to_categories` where `store_id` not in (select `uid` from `cw_stores`)')
            ->execute();
        $this->addForeignKey (
            'fk_stores_to_categories_store_id',
            'cw_stores_to_categories',
            'store_id',
            'cw_stores',
            'uid',
            'CASCADE');
        \Yii::$app->db->createCommand('delete from `cw_stores_to_categories` where `category_id` not in (select `uid` from `cw_categories_stores`)')
            ->execute();
        $this->addForeignKey (
            'fk_stores_to_categories_category_id',
            'cw_stores_to_categories',
            'category_id',
            'cw_categories_stores',
            'uid',
            'CASCADE');

    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropForeignKey('fk_stores_to_categories_store_id', 'cw_stores_to_categories');
        $this->dropForeignKey('fk_stores_to_categories_category_id', 'cw_stores_to_categories');


    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180326_142025_AddForeignKeysStoresToCategoriesTable cannot be reverted.\n";

        return false;
    }
    */
}
