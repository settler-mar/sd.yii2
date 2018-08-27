<?php

use yii\db\Migration;

/**
 * Class m180827_120752_AddCouponIdColumnCouponsTable
 */
class m180827_120752_AddCouponIdColumnCouponsTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->addColumn('cw_users_reviews', 'coupon_id', $this->integer()->defaultValue(0));
        $this->createIndex('idx_cw_users_reviews_coupon_id', 'cw_users_reviews', 'coupon_id', false);
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropColumn('cw_users_reviews', 'coupon_id');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180827_120752_AddCouponIdColumnCouponsTable cannot be reverted.\n";

        return false;
    }
    */
}
