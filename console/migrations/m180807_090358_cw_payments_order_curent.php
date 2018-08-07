<?php

use yii\db\Migration;

/**
 * Class m180807_090358_cw_payments_order_curent
 */
class m180807_090358_cw_payments_order_curent extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
      $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
      $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

      $this->addColumn('cw_payments', 'cpa_link_id', $this->integer());
      $this->addColumn('cw_payments', 'currency', $this->string(3));

      $this->execute('UPDATE cw_payments AS b
          
          INNER JOIN cw_cpa_link AS g ON b.affiliate_id = g.affiliate_id
          INNER JOIN cw_stores AS a ON a.uid = g.stores_id
          
          
          SET b.cpa_link_id = g.id,
              b.currency = a.currency');

      $this->dropForeignKey('fk_payments_cpa_id_affiliate_id', 'cw_payments');

      $this->addForeignKey (
          'fk_payments_cpa_id_cpa_link_id',
          'cw_payments',
          ['cpa_link_id'],
          'cw_cpa_link',
          ['id']
      );
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {

    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180807_090358_cw_payments_order_curent cannot be reverted.\n";

        return false;
    }
    */
}
