<?php

use yii\db\Migration;

class m170906_071422_store_edit_col extends Migration
{
    public function safeUp()
    {
      $this->alterColumn('cw_cpa_link', 'affiliate_link', $this->string()->null());
      $this->alterColumn('cw_stores', 'logo', $this->string()->null());
    }

    public function safeDown()
    {
        echo "m170906_071422_store_edit_col cannot be reverted.\n";

        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m170906_071422_store_edit_col cannot be reverted.\n";

        return false;
    }
    */
}
