<?php

use yii\db\Migration;

/**
 * Class m180508_141136_CreateLgCategoriesCouponsTable
 */
class m180508_141136_CreateLgCategoriesCouponsTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->createTable('lg_categories_coupons', [
            'uid' => $this->primaryKey(),
            'category_id' => $this->integer()->notNull(),
            'language' => $this->string(10)->notNull(),
            'name' => $this->string()->notNull(),
            'description' => $this->text(),
            'short_description' => $this->text(),
            'short_description_offline' => $this->text(),
        ]);
        $this->createIndex(
            'idx_lg_categories_coupons_category_id_language',
            'lg_categories_coupons',
            ['category_id', 'language'],
            true
        );
        $this->addForeignKey(
            'fk_lg_categories_coupons',
            'lg_categories_coupons',
            'category_id',
            'cw_categories_coupons',
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

        $this->dropTable('lg_categories_coupons');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180508_141136_CreateLgCategoriesCouponsTable cannot be reverted.\n";

        return false;
    }
    */
}
