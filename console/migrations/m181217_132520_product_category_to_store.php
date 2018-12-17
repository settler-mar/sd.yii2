<?php

use yii\db\Migration;

/**
 * Class m181217_132520_product_category_to_store
 */
class m181217_132520_product_category_to_store extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
      $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
      $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

      $this->addColumn('cw_products_category', 'store_id', $this->integer()->after('parent')->null());
      $this->addColumn('cw_products_category', 'cpa_id', $this->integer()->after('store_id')->null());

      $this->addForeignKey (
          'cw_products_category_store_id',
          'cw_products_category',
          'store_id',
          'cw_stores',
          'uid'
      );

      $this->addForeignKey (
          'cw_products_category_cpa_id',
          'cw_products_category',
          'cpa_id',
          'cw_cpa',
          'id'
      );

    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
      $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
      $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

      $this->dropColumn('cw_products_category', 'store_id');
      $this->dropColumn('cw_products_category', 'cpa_id');

      $this->dropForeignKey('cw_products_category_store_id', 'cw_products_category');
      $this->dropForeignKey('fk_b2b_stores_poins_store_id', 'cw_products_category');
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181217_132520_product_category_to_store cannot be reverted.\n";

        return false;
    }
    */
}
