<?php

use yii\db\Migration;

/**
 * Class m180326_152747_AddForeignKeyStoresCategoryToCouponsCategoryTable
 */
class m180326_152747_AddForeignKeyStoresCategoryToCouponsCategoryTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->addForeignKey (
            'fk_stores_category_to_coupons_category_store_category_id',
            'cw_stores_category_to_coupons_category',
            'store_category_id',
            'cw_categories_stores',
            'uid',
            'CASCADE'
        );
        $this->addForeignKey (
            'fk_stores_category_to_coupons_category_coupon_category_id',
            'cw_stores_category_to_coupons_category',
            'coupon_category_id',
            'cw_categories_coupons',
            'uid',
            'CASCADE'
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
            'fk_stores_category_to_coupons_category_store_category_id',
            'cw_stores_category_to_coupons_category'
        );
        $this->dropForeignKey(
            'fk_stores_category_to_coupons_category_coupon_category_id',
            'cw_stores_category_to_coupons_category'
        );
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180326_152747_AddForeignKeyStoresCategoryToCouponsCategoryTable cannot be reverted.\n";

        return false;
    }
    */
}
