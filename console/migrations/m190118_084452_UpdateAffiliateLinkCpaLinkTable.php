<?php

use yii\db\Migration;

/**
 * Class m190118_084452_UpdateAffiliateLinkCpaLinkTable
 */
class m190118_084452_UpdateAffiliateLinkCpaLinkTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->alterColumn('cw_cpa_link', 'affiliate_link', $this->text());
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
        echo "m190118_084452_UpdateAffiliateLinkCpaLinkTable cannot be reverted.\n";

        return false;
    }
    */
}
