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
      $sql = 'UPDATE `cw_coupons` cwc INNER JOIN `cw_stores` cws ON cws.uid = cwc.store_id '.
        ' LEFT JOIN `cw_cpa_link` cwcl ON cwcl.id = cws.active_cpa set cwc.cpa_id = cwcl.cpa_id WHERE NOT cwcl.cpa_id IS NULL';
      $this->execute($sql);
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
      $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
      $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

      $this->dropForeignKey('fk_cw_cpa_coupon_cpa_id','cw_coupons');

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
