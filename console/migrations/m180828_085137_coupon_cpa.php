<?php

use yii\db\Migration;

/**
 * Class m180828_085137_coupon_cpa
 */
class m180828_085137_coupon_cpa extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
      $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
      $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

      $this->addColumn('cw_coupons', 'cpa_id', $this->integer()->null());
      $this->addForeignKey(
          'fk_cw_cpa_coupon_cpa_id',
          'cw_coupons',
          'cpa_id',
          'cw_cpa',
          'id'
      );

      $this->execute('UPDATE `cw_coupons` SET `cpa_id` = \'1\' WHERE date_end<\'2018-08-29 23:59:00\'');
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
      $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
      $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

      $this->dropColumn('cw_coupons', 'cpa_id');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180828_085137_coupon_cpa cannot be reverted.\n";

        return false;
    }
    */
}
