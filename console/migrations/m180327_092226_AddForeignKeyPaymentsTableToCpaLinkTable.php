<?php

use yii\db\Migration;

/**
 * Class m180327_092226_AddForeignKeyPaymentsTableToCpaLinkTable
 */
class m180327_092226_AddForeignKeyPaymentsTableToCpaLinkTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->createIndex('unique_cpa_link_cpa_id_affiliate_id', 'cw_cpa_link', ['cpa_id', 'affiliate_id'], true);

        $this->addForeignKey (
            'fk_payments_cpa_id_affiliate_id',
            'cw_payments',
            ['cpa_id', 'affiliate_id'],
            'cw_cpa_link',
            ['cpa_id', 'affiliate_id']
        );
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->execute('SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE=\'TRADITIONAL,ALLOW_INVALID_DATES\';');
        $this->execute('SET SQL_MODE=\'ALLOW_INVALID_DATES\';');

        $this->dropForeignKey('fk_payments_cpa_id_affiliate_id', 'cw_payments');
        $this->dropIndex('unique_cpa_link_cpa_id_affiliate_id', 'cw_cpa_link');

    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m180327_092226_AddForeignKeyPaymentsTableToCpaLinkTable cannot be reverted.\n";

        return false;
    }
    */
}
