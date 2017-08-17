<?php

use yii\db\Migration;

class m170817_104516_edit_coupons extends Migration
{
    public function safeUp()
    {
      $this->alterColumn('cw_coupons','visit',$this->integer()->null()->defaultValue(0));
      $this->dropColumn('cw_coupons', 'image');
    }

    public function safeDown()
    {
        echo "m170817_104516_edit_coupons cannot be reverted.\n";

        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m170817_104516_edit_coupons cannot be reverted.\n";

        return false;
    }
    */
}
