<?php

use yii\db\Migration;

/**
 * Class m181101_071437_modifecate_catalog_stores
 */
class m181101_071437_modifecate_catalog_stores extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
      $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
      $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

      $this->addColumn('cw_catalog_stores', 'csv', $this->string()->after('cpa_id'));
      $this->addColumn('cw_catalog_stores', 'name', $this->string()->after('cpa_id'));
      $this->dropColumn('cw_catalog_stores', 'affiliate_id');
      $this->dropForeignKey('fk_catalog_stores_cpa_id', 'cw_catalog_stores');
      $this->dropColumn('cw_catalog_stores', 'cpa_id');
      $this->addColumn('cw_catalog_stores', 'cpa_link_id', $this->integer()->after('id'));
      $this->addForeignKey(
          'fk_product_cpa_link_id',
          'cw_catalog_stores',
          'cpa_link_id',
          'cw_cpa_link',
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

      $this->dropColumn('cw_catalog_stores', 'csv');
      $this->dropColumn('cw_catalog_stores', 'name');
      $this->dropColumn('cw_catalog_stores', 'cw_cpa_link');
      $this->addColumn('cw_catalog_stores', 'cpa_id', $this->integer()->after('id'));
      $this->addColumn('cw_catalog_stores', 'affiliate_id', $this->integer()->after('cpa_id'));

      $this->addForeignKey(
          'fk_catalog_stores_cpa_id',
          'cw_catalog_stores',
          'cpa_id',
          'cw_cpa',
          'id'
      );
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m181101_071437_modifecate_catalog_stores cannot be reverted.\n";

        return false;
    }
    */
}
