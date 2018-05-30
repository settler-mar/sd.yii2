<?php

use yii\db\Migration;

/**
 * Class m180504_071633_CreateLsStoresTable
 */
class m180504_071633_CreateLsStoresTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->createTable('lg_stores', [
            'uid' => $this->primaryKey(),
            'store_id' => $this->integer()->notNull(),
            'language' => $this->string(10)->notNull(),
            'description' => $this->text(),
            'conditions' => $this->text(),
            'short_description' => $this->text(),
            'local_name' => $this->string(),
            'contact_name' => $this->string(),
            'contact_phone' => $this->string(),
            'contact_email' => $this->string(),
            'coupon_description' => $this->text(),
        ]);
        $this->createIndex('idx_lg_stores_store_id_language', 'lg_stores', ['store_id', 'language'], true);
        $this->addForeignKey('fk_lg_stores', 'lg_stores', 'store_id', 'cw_stores', 'uid');
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropTable('lg_stores');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180504_071633_CreateLsStoresTable cannot be reverted.\n";

        return false;
    }
    */
}
