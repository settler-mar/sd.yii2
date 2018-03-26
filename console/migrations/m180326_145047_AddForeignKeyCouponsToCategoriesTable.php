<?php

use yii\db\Migration;

/**
 * Class m180326_145047_AddForeignKeyCouponsToCategoriesTable
 */
class m180326_145047_AddForeignKeyCouponsToCategoriesTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        \Yii::$app->db->createCommand('delete from `cw_coupons_to_categories` where `coupon_id` not in (select `uid` from `cw_coupons`)')
            ->execute();
        $this->addForeignKey (
            'fk_coupons_to_categories_coupon_id',
            'cw_coupons_to_categories',
            'coupon_id',
            'cw_coupons',
            'uid',
            'CASCADE');
        \Yii::$app->db->createCommand('delete from `cw_coupons_to_categories` where `category_id` not in (select `uid` from `cw_categories_coupons`)')
            ->execute();
        $this->addForeignKey (
            'fk_coupons_to_categories_category_id',
            'cw_coupons_to_categories',
            'category_id',
            'cw_categories_coupons',
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

        $this->dropForeignKey('fk_coupons_to_categories_coupon_id', 'cw_coupons_to_categories');
        $this->dropForeignKey('fk_coupons_to_categories_category_id', 'cw_coupons_to_categories');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180326_145047_AddForeignKeyCouponsToCategoriesTable cannot be reverted.\n";

        return false;
    }
    */
}
