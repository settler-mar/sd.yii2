<?php

use yii\db\Migration;

/**
 * Class m180313_131339_CreateStoresCategoryToCouponsCategoryTable
 */
class m180313_131339_CreateStoresCategoryToCouponsCategoryTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->createTable('cw_stores_category_to_coupons_category', [
            'id' => $this->primaryKey(),
            'store_category_id' => $this->integer()->notNull(),
            'coupon_category_id' => $this->integer()->notNull(),
        ]);
        $this->createIndex(
            'idx_stores_category_to_coupons_category',
            'cw_stores_category_to_coupons_category',
            ['store_category_id', 'coupon_category_id'],
            true
        );
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropTable('cw_stores_category_to_coupons_category');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180313_131339_CreateStoresCategoryToCouponsCategoryTable cannot be reverted.\n";

        return false;
    }
    */
}
