<?php

use yii\db\Migration;

/**
 * Class m180515_115922_AddHideHighMenuColunmCategoryCouponTable
 */
class m180515_115922_AddHideHighMenuColunmCategoryCouponTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->addColumn('cw_categories_coupons', 'hide_high_menu', $this->boolean()->defaultValue(0));
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropColumn('cw_categories_coupons', 'hide_high_menu');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180515_115922_AddHideHighMenuColunmCategoryCouponTable cannot be reverted.\n";

        return false;
    }
    */
}
