<?php

use yii\db\Migration;

class m170819_113353_editStoreCol extends Migration
{
    public function safeUp()
    {
      $this->alterColumn('cw_stores','alias',$this->text()->null());
      $this->alterColumn('cw_stores','description',$this->text()->null());
      $this->alterColumn('cw_stores','displayed_cashback',$this->string(30)->null());
      $this->alterColumn('cw_stores','conditions',$this->text()->null());
      $this->alterColumn('cw_stores','visit',$this->integer()->null()->defaultValue(0));
    }

    public function safeDown()
    {
        echo "m170819_113353_editStoreCol cannot be reverted.\n";

        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m170819_113353_editStoreCol cannot be reverted.\n";

        return false;
    }
    */
}
