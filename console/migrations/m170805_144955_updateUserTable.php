<?php

use yii\db\Migration;

class m170805_144955_updateUserTable extends Migration
{
    public function safeUp()
    {
      $this->alterColumn('cw_users','birthday',$this->date()->null());
      $this->alterColumn('cw_users','sex',$this->string(1)->null());
      $this->alterColumn('cw_users','salt',$this->string()->null());
      $this->alterColumn('cw_users','photo',$this->string()->null());
      $this->alterColumn('cw_users','bonus_status',$this->integer(2)->null()->defaultValue(0));
      $this->alterColumn('cw_users','loyalty_status',$this->integer(2)->null()->defaultValue(0));
      $this->alterColumn('cw_users','is_admin',$this->integer(1)->null()->defaultValue(0));
      $this->alterColumn('cw_users','is_active',$this->integer(1)->null()->defaultValue(1));
      $this->alterColumn('cw_users','registration_source',$this->string(255)->null()->defaultValue(''));
      $this->alterColumn('cw_users','notice_account',$this->integer(1)->null()->defaultValue(1));
      $this->alterColumn('cw_users','notice_email',$this->integer(1)->null()->defaultValue(1));
      $this->alterColumn('cw_users','last_ip',$this->string(20)->null());
      $this->alterColumn('cw_users','last_login',$this->dateTime()->null());
      $this->alterColumn('cw_users','referrer_id',$this->integer()->null()->defaultValue(0));
    }

    public function safeDown()
    {
        echo "m170805_144955_updateUserTable cannot be reverted.\n";

        return false;
    }

    /*
    // Use up()/down() to run migration code without a transaction.
    public function up()
    {

    }

    public function down()
    {
        echo "m170805_144955_updateUserTable cannot be reverted.\n";

        return false;
    }
    */
}
