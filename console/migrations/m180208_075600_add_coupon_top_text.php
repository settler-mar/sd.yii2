<?php

use yii\db\Migration;

/**
 * Class m180208_075600_add_coupon_top_text
 */
class m180208_075600_add_coupon_top_text extends Migration
{
    /**
     * @inheritdoc
     */
    public function safeUp()
    {
      $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
      $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

      $this->addColumn('cw_categories_coupons', 'description', $this->text()->null());
    }

    /**
     * @inheritdoc
     */
    public function safeDown()
    {
        echo "m180208_075600_add_coupon_top_text cannot be reverted.\n";
      $this->dropColumn('cw_categories_coupons', 'description');
        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180208_075600_add_coupon_top_text cannot be reverted.\n";

        return false;
    }
    */
}
