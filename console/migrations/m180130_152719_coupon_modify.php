<?php

use yii\db\Migration;

/**
 * Class m180130_152719_coupon_modify
 */
class m180130_152719_coupon_modify extends Migration
{
    /**
     * @inheritdoc
     */
    public function safeUp()
    {
      $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
      $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');
      $this->execute('UPDATE `cw_coupons` SET `promocode` = \'\' WHERE promocode=\'НЕ НУЖЕН\';');
      $this->execute('UPDATE `cw_coupons` SET `promocode` = \'\' WHERE promocode=\'NOT REQUIRED\';');
      $this->execute('UPDATE `cw_coupons` SET `promocode` = \'\' WHERE promocode=\'Не нужен\';');

    }

    /**
     * @inheritdoc
     */
    public function safeDown()
    {
        echo "m180130_152719_coupon_modify cannot be reverted.\n";

        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180130_152719_coupon_modify cannot be reverted.\n";

        return false;
    }
    */
}
