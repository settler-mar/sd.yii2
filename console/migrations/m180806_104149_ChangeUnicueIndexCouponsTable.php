<?php

use yii\db\Migration;

/**
 * Class m180806_104149_ChangeUnicueIndexCouponsTable
 */
class m180806_104149_ChangeUnicueIndexCouponsTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropIndex('coupon_id_2', 'cw_coupons');
        $this->createIndex('unique_coupons_store_id_coupon_id', 'cw_coupons', ['store_id', 'coupon_id'], true);
        $this->createIndex('idx_coupons_name_promocode', 'cw_coupons', ['name', 'promocode']);
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropIndex('unique_coupons_store_id_coupon_id', 'cw_coupons');
        $this->dropIndex('idx_coupons_name_promocode', 'cw_coupons');
        $this->createIndex('coupon_id_2', 'cw_coupons', ['coupon_id'], true);
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180806_104149_ChangeUnicueIndexCouponsTable cannot be reverted.\n";

        return false;
    }
    */
}
